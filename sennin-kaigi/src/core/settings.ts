import { useState } from "react";

export type ProviderKind = "mock" | "local" | "api";

export interface ProviderConfig {
  baseUrl: string; // OpenAI 互換のベース (…/v1)
  model: string;
  apiKey: string;
}

export interface Settings {
  active: ProviderKind;
  local: ProviderConfig;
  api: ProviderConfig;
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

// active な接続先の設定を取り出す(mock は cfg を使わない)
export function activeConfig(s: Settings): ProviderConfig {
  return s.active === "api" ? s.api : s.local;
}
