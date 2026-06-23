import { useRef, useState } from "react";
import type { Discussion, Persona, Utterance } from "../types";
import { personaById, MODERATOR } from "../data/personas";
import { Transcript, type StreamingState } from "../components/Transcript";
import { ParticipantStrip } from "../components/ParticipantStrip";
import { SettingsModal } from "../components/SettingsModal";
import { ModelAssignModal } from "../components/ModelAssignModal";
import { useSettings, PROVIDER_LABEL, type ProviderKind } from "../core/settings";
import { runDiscussion, summarizeDiscussion } from "../core/orchestrator";

export function Arena({
  discussion,
  onUpdate,
}: {
  discussion: Discussion;
  onUpdate: (id: string, patch: Partial<Discussion>) => void;
}) {
  const [settings, setSettings] = useSettings();
  const [utterances, setUtterances] = useState<Utterance[]>(discussion.utterances);
  const [streaming, setStreaming] = useState<StreamingState | null>(null);
  const [running, setRunning] = useState(false);
  const [summarizing, setSummarizing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [assignOpen, setAssignOpen] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  const participants: Persona[] = [
    MODERATOR,
    ...discussion.participantIds.map((id) => personaById[id]).filter(Boolean),
  ];

  const run = async (mode: "fresh" | "continue") => {
    if (running) return;
    setError(null);
    const cont = mode === "continue";
    const seed = cont ? utterances : [];
    if (!cont) setUtterances([]);
    setStreaming(null);
    const ac = new AbortController();
    abortRef.current = ac;
    setRunning(true);
    onUpdate(discussion.id, { status: "running" });

    const collected: Utterance[] = [...seed];
    try {
      await runDiscussion(
        settings,
        discussion,
        {
          onStart: (persona) => setStreaming({ persona, text: "" }),
          onToken: (t) =>
            setStreaming((s) => (s ? { ...s, text: s.text + t } : s)),
          onUtterance: (u) => {
            collected.push(u);
            setUtterances((x) => [...x, u]);
            setStreaming(null);
          },
        },
        ac.signal,
        cont ? { initialTranscript: seed, addRounds: 1 } : {}
      );

      // 要約生成(再開時はラウンド数も加算)
      setSummarizing(true);
      const sum = await summarizeDiscussion(settings, discussion, collected, ac.signal);
      onUpdate(discussion.id, {
        utterances: collected,
        summary: sum.summary,
        keyPoints: sum.keyPoints,
        status: "done",
        rounds: cont ? discussion.rounds + 1 : discussion.rounds,
      });
    } catch (e) {
      const err = e as { name?: string; message?: string };
      if (err?.name !== "AbortError") setError(err?.message ?? String(e));
      onUpdate(discussion.id, {
        utterances: collected,
        status: collected.length ? "done" : "draft",
      });
    } finally {
      setRunning(false);
      setSummarizing(false);
      setStreaming(null);
      abortRef.current = null;
    }
  };

  const stop = () => abortRef.current?.abort();
  const hasLog = utterances.length > 0;

  return (
    <section className="arena">
      <div className="arena__head">
        <a className="link" href="#/">
          ← 一覧へ
        </a>
        <div className="arena__tools">
          <div className="seg" role="group" aria-label="接続先">
            {(["mock", "local", "api"] as ProviderKind[]).map((k) => (
              <button
                key={k}
                className={"seg__btn" + (settings.active === k ? " seg__btn--on" : "")}
                onClick={() => setSettings({ ...settings, active: k })}
                disabled={running}
              >
                {PROVIDER_LABEL[k]}
              </button>
            ))}
          </div>
          <button
            className="iconbtn"
            title="モデル割当(人物ごと)"
            onClick={() => setAssignOpen(true)}
            disabled={running}
          >
            ⚖
          </button>
          <button className="iconbtn" title="接続設定" onClick={() => setSettingsOpen(true)}>
            ⚙
          </button>
        </div>
      </div>

      <div className="arena__topic">
        <h2 className="arena__title">{discussion.topic}</h2>
        <p className="arena__goal">
          <span className="tag">ゴール</span>
          {discussion.goal || "（未設定）"}
        </p>
        <ParticipantStrip personas={participants} />
      </div>

      <div className="arena__body">
        <div className="arena__chat">
          <Transcript
            personas={personaById}
            utterances={utterances}
            streaming={streaming}
          />
        </div>
      </div>

      {error && <div className="errbar">⚠ {error}</div>}

      <div className="runbar">
        {running ? (
          <>
            <button className="btn btn--danger" onClick={stop}>
              ■ 停止
            </button>
            <span className="running-note">
              {summarizing ? "要約を生成中…" : "議論を進行中…"}
            </span>
          </>
        ) : (
          <>
            <button className="btn btn--primary" onClick={() => run("fresh")}>
              {hasLog ? "↻ 再実行" : "▶ 議論を開始"}
            </button>
            {hasLog && (
              <button className="btn btn--ghost" onClick={() => run("continue")}>
                ↳ 続きを1ラウンド
              </button>
            )}
          </>
        )}
      </div>

      {settingsOpen && (
        <SettingsModal
          settings={settings}
          onSave={setSettings}
          onClose={() => setSettingsOpen(false)}
        />
      )}
      {assignOpen && (
        <ModelAssignModal
          personas={participants}
          settings={settings}
          onSave={setSettings}
          onClose={() => setAssignOpen(false)}
        />
      )}
    </section>
  );
}
