import { useState } from "react";

// 接続先は「デモ」と「Ollama」の2択
export type ProviderKind = "mock" | "ollama";

export interface ProviderConfig {
  baseUrl: string; // OpenAI 互換のベース (…/v1)
  model: string;
  apiKey: string; // Ollama では未使用(将来の互換のため保持)
}

// 人物ごとのモデル上書き(任意)。司会だけ賢いモデルにする等。
export interface PersonaOverride {
  kind: ProviderKind;
  model: string; // 空なら接続先の既定モデル
}

export interface Settings {
  active: ProviderKind;
  ollama: ProviderConfig;
  overrides: Record<string, PersonaOverride>; // personaId -> 上書き
}

export const PROVIDER_LABEL: Record<ProviderKind, string> = {
  mock: "デモ",
  ollama: "Ollama",
};

export const PROVIDER_KINDS: ProviderKind[] = ["mock", "ollama"];

const DEFAULTS: Settings = {
  active: "mock",
  ollama: { baseUrl: "http://localhost:11434/v1", model: "llama3.2", apiKey: "" },
  overrides: {},
};

const KEY = "sennin.settings";

function normalizeKind(k: unknown): ProviderKind {
  return k === "mock" ? "mock" : "ollama";
}

function normalizeOverrides(
  raw: unknown
): Record<string, PersonaOverride> {
  const out: Record<string, PersonaOverride> = {};
  if (raw && typeof raw === "object") {
    for (const [id, v] of Object.entries(raw as Record<string, unknown>)) {
      const ov = v as { kind?: unknown; model?: unknown };
      out[id] = { kind: normalizeKind(ov.kind), model: String(ov.model ?? "") };
    }
  }
  return out;
}

export function loadSettings(): Settings {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return DEFAULTS;
    const parsed = JSON.parse(raw) as Record<string, unknown>;
    // 旧バージョン(local/api)からの移行も兼ねる
    return {
      active:
        parsed.active === "mock" || parsed.active === "ollama"
          ? (parsed.active as ProviderKind)
          : parsed.active
            ? "ollama"
            : DEFAULTS.active,
      ollama: {
        ...DEFAULTS.ollama,
        ...((parsed.ollama as Partial<ProviderConfig>) ?? {}),
      },
      overrides: normalizeOverrides(parsed.overrides),
    };
  } catch {
    return DEFAULTS;
  }
}

export function saveSettings(s: Settings) {
  try {
    localStorage.setItem(KEY, JSON.stringify(s));
  } catch {
    /* ignore */
  }
}

export function useSettings(): [Settings, (s: Settings) => void] {
  const [s, setS] = useState<Settings>(loadSettings());
  const update = (next: Settings) => {
    setS(next);
    saveSettings(next);
  };
  return [s, update];
}

export interface Resolved {
  kind: ProviderKind;
  cfg: ProviderConfig;
}

// 人物の発言に使う接続先を解決する(上書きがあれば優先)
export function resolveProvider(s: Settings, personaId: string): Resolved {
  const ov = s.overrides?.[personaId];
  const kind = ov?.kind ?? s.active;
  const cfg = ov?.model ? { ...s.ollama, model: ov.model } : s.ollama;
  return { kind, cfg };
}
