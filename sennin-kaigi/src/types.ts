export interface Persona {
  id: string;
  name: string;
  title: string; // 一言の肩書き
  color: string; // アクセント色
  initial: string; // アバターの文字
  prompt: string; // 人格・語り口(LLMのsystem prompt素材)
}

export interface Utterance {
  id: string;
  personaId: string;
  round: number;
  text: string;
}

export type DiscussionStatus = "draft" | "running" | "done";

export interface Discussion {
  id: string;
  topic: string; // テーマ
  goal: string; // ゴール
  participantIds: string[]; // 対話者(司会を除く)
  rounds: number; // 想定ラウンド数
  status: DiscussionStatus;
  createdAt: string; // 表示用の日付文字列
  utterances: Utterance[]; // 論壇のログ
  summary: string; // 流れのまとめ(本文)
  keyPoints: string[]; // 流れのまとめ(箇条書き)
}

export type Provider = "local" | "api";
