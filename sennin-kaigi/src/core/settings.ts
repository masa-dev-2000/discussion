import { useState } from "react";

export type ProviderKind = "mock" | "local" | "api";

export interface ProviderConfig {
  baseUrl: string; // OpenAI 互換のベース (…/v1)
  model: string;
  apiKey: string;
}

// 人物ごとのモデル上書き(任意)。司会だけ賢いモデルにする等。
export interface PersonaOverride {
  kind: ProviderKind;
  model: string; // 空なら接続先の既定モデル
}

export interface Settings {
  active: ProviderKind;
  local: ProviderConfig;
  api: ProviderConfig;
  overrides: Record<string, PersonaOverride>; // personaId -> 上書き
}

export const PROVIDER_LABEL: Record<ProviderKind, string> = {
  mock: "デモ",
  local: "ローカル",
  api: "API",
};

const DEFAULTS: Settings = {
  active: "mock",
  local: { baseUrl: "http://localhost:1234/v1", model: "local-model", apiKey: "" },
  api: { baseUrl: "https://api.openai.com/v1", model: "gpt-4o-mini", apiKey: "" },
  overrides: {},
};

const KEY = "sennin.settings";

export function loadSettings(): Settings {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return DEFAULTS;
    return { ...DEFAULTS, ...JSON.parse(raw) };
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

export function activeConfig(s: Settings): ProviderConfig {
  return s.active === "api" ? s.api : s.local;
}

export interface Resolved {
  kind: ProviderKind;
  cfg: ProviderConfig;
}

// 人物の発言に使う接続先を解決する(上書きがあれば優先)
export function resolveProvider(s: Settings, personaId: string): Resolved {
  const ov = s.overrides?.[personaId];
  const kind = ov?.kind ?? s.active;
  const base = kind === "api" ? s.api : s.local;
  const cfg = ov?.model ? { ...base, model: ov.model } : base;
  return { kind, cfg };
}
