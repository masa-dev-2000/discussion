import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import type { Discussion } from "../types";
import type { Settings } from "./settings";
import { runDiscussion, summarizeDiscussion } from "./orchestrator";
import { listModels } from "./providers";

export interface RunState {
  phase: "debating" | "summarizing";
  streaming: { personaId: string; text: string } | null;
}

export type Health = "unknown" | "checking" | "ok" | "down";

interface RunsContextValue {
  runs: Record<string, RunState>;
  errors: Record<string, string>;
  activeCount: number;
  maxConcurrent: number;
  health: Health;
  healthError: string;
  start: (id: string, mode: "fresh" | "continue") => void;
  stop: (id: string) => void;
  checkHealth: () => void;
  canStart: (id: string) => boolean;
}

const Ctx = createContext<RunsContextValue | null>(null);

export function useRuns(): RunsContextValue {
  const v = useContext(Ctx);
  if (!v) throw new Error("useRuns must be used within RunsProvider");
  return v;
}

export function RunsProvider({
  settings,
  getDiscussion,
  patchDiscussion,
  children,
}: {
  settings: Settings;
  getDiscussion: (id: string) => Discussion | undefined;
  patchDiscussion: (id: string, patch: Partial<Discussion>) => void;
  children: ReactNode;
}) {
  const [runs, setRuns] = useState<Record<string, RunState>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [health, setHealth] = useState<Health>("unknown");
  const [healthError, setHealthError] = useState("");

  const aborts = useRef<Map<string, AbortController>>(new Map());

  // 最新値を非同期ループから参照するための ref
  const settingsRef = useRef(settings);
  settingsRef.current = settings;
  const runsRef = useRef(runs);
  runsRef.current = runs;
  const healthRef = useRef(health);
  healthRef.current = health;
  const getDiscRef = useRef(getDiscussion);
  getDiscRef.current = getDiscussion;
  const patchRef = useRef(patchDiscussion);
  patchRef.current = patchDiscussion;

  const maxConcurrent = Math.max(1, settings.maxConcurrent ?? 1);
  const activeCount = Object.keys(runs).length;

  const checkHealth = useCallback(async () => {
    const s = settingsRef.current;
    if (s.active === "mock") {
      setHealth("ok");
      setHealthError("");
      return;
    }
    setHealth("checking");
    try {
      await listModels("ollama", s.ollama);
      setHealth("ok");
      setHealthError("");
    } catch (e) {
      setHealth("down");
      setHealthError((e as { message?: string })?.message ?? String(e));
    }
  }, []);

  // 接続先が変わったら健全性を再チェック
  useEffect(() => {
    checkHealth();
  }, [settings.active, settings.ollama.baseUrl, checkHealth]);

  const canStart = useCallback(
    (id: string) => {
      if (runs[id]) return false; // 既に実行中
      if (activeCount >= maxConcurrent) return false; // 実行枠が満杯
      if (settings.active !== "mock" && health !== "ok") return false; // 接続不可
      return true;
    },
    [runs, activeCount, maxConcurrent, settings.active, health]
  );

  const runLoop = useCallback(async (id: string, mode: "fresh" | "continue") => {
    const d = getDiscRef.current(id);
    if (!d) return;

    const ac = new AbortController();
    aborts.current.set(id, ac);
    setErrors((e) => {
      const n = { ...e };
      delete n[id];
      return n;
    });
    setRuns((r) => ({ ...r, [id]: { phase: "debating", streaming: null } }));
    patchRef.current(id, { status: "running" });

    const seed = mode === "continue" ? d.utterances : [];
    if (mode !== "continue") patchRef.current(id, { utterances: [] });
    const collected = [...seed];

    // トークン更新は rAF で間引く(高速モデルでも UI が固まらない)
    let streamText = "";
    let scheduled = false;
    const flush = () => {
      scheduled = false;
      setRuns((r) =>
        r[id] && r[id].streaming
          ? { ...r, [id]: { ...r[id], streaming: { ...r[id].streaming!, text: streamText } } }
          : r
      );
    };
    const schedule = () => {
      if (scheduled) return;
      scheduled = true;
      requestAnimationFrame(flush);
    };

    try {
      await runDiscussion(
        settingsRef.current,
        d,
        {
          onStart: (p) => {
            streamText = "";
            setRuns((r) => ({
              ...r,
              [id]: { ...(r[id] ?? { phase: "debating" }), phase: "debating", streaming: { personaId: p.id, text: "" } },
            }));
          },
          onToken: (tok) => {
            streamText += tok;
            schedule();
          },
          onUtterance: (u) => {
            streamText = "";
            collected.push(u);
            patchRef.current(id, { utterances: [...collected] });
            setRuns((r) => (r[id] ? { ...r, [id]: { ...r[id], streaming: null } } : r));
          },
        },
        ac.signal,
        mode === "continue" ? { initialTranscript: seed, addRounds: 1 } : {}
      );

      setRuns((r) =>
        r[id] ? { ...r, [id]: { ...r[id], phase: "summarizing", streaming: null } } : r
      );
      const sum = await summarizeDiscussion(settingsRef.current, d, collected, ac.signal);
      patchRef.current(id, {
        utterances: collected,
        summary: sum.summary,
        keyPoints: sum.keyPoints,
        status: "done",
        rounds: mode === "continue" ? d.rounds + 1 : d.rounds,
      });
    } catch (e) {
      const err = e as { name?: string; message?: string };
      if (err?.name !== "AbortError") {
        setErrors((er) => ({ ...er, [id]: err?.message ?? String(e) }));
      }
      patchRef.current(id, {
        utterances: collected,
        status: collected.length ? "done" : "draft",
      });
    } finally {
      aborts.current.delete(id);
      setRuns((r) => {
        const n = { ...r };
        delete n[id];
        return n;
      });
    }
  }, []);

  const start = useCallback(
    (id: string, mode: "fresh" | "continue") => {
      if (runsRef.current[id]) return;
      const max = Math.max(1, settingsRef.current.maxConcurrent ?? 1);
      if (Object.keys(runsRef.current).length >= max) return;
      if (settingsRef.current.active !== "mock" && healthRef.current !== "ok") return;
      void runLoop(id, mode);
    },
    [runLoop]
  );

  const stop = useCallback((id: string) => {
    aborts.current.get(id)?.abort();
  }, []);

  const value: RunsContextValue = {
    runs,
    errors,
    activeCount,
    maxConcurrent,
    health,
    healthError,
    start,
    stop,
    checkHealth,
    canStart,
  };

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}
