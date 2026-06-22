export interface Persona {
  id: string;
  name: string;
  title: string; // 一言の肩書き
  color: string; // アクセント色
  initial: string; // アバターの文字
}

export interface Utterance {
  id: string;
  personaId: string;
  round: number;
  text: string;
}

export type Provider = "local" | "api";
