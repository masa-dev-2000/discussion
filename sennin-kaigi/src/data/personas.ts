import type { Persona } from "../types";

// 司会は常に同席する特別枠
export const MODERATOR: Persona = {
  id: "moderator",
  name: "司会",
  title: "進行・収束",
  color: "#c8a86a",
  initial: "司",
};

// 設定画面で選べる対話者カタログ
export const CATALOG: Persona[] = [
  { id: "socrates", name: "ソクラテス", title: "前提を問う者", color: "#6ea8c8", initial: "ソ" },
  { id: "plato", name: "プラトン", title: "イデアの徒", color: "#7e9bd0", initial: "プ" },
  { id: "aristotle", name: "アリストテレス", title: "範疇の祖", color: "#c08457", initial: "ア" },
  { id: "descartes", name: "デカルト", title: "懐疑の方法者", color: "#5b8fc2", initial: "デ" },
  { id: "kant", name: "カント", title: "認識の批判者", color: "#8e7bc4", initial: "カ" },
  { id: "hegel", name: "ヘーゲル", title: "弁証の人", color: "#9b6fb0", initial: "ヘ" },
  { id: "nietzsche", name: "ニーチェ", title: "価値の鎚", color: "#c25b5b", initial: "ニ" },
  { id: "buddha", name: "仏陀", title: "無常を説く者", color: "#5fae8e", initial: "仏" },
  { id: "laozi", name: "老子", title: "無為の人", color: "#6fae9e", initial: "老" },
  { id: "confucius", name: "孔子", title: "礼の師", color: "#c9a05b", initial: "孔" },
];

export const ALL_PERSONAS: Persona[] = [MODERATOR, ...CATALOG];

export const personaById: Record<string, Persona> = Object.fromEntries(
  ALL_PERSONAS.map((p) => [p.id, p])
);
