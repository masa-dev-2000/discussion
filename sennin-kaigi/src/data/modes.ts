import type { DiscussionMode } from "../types";

export interface ModeDef {
  id: DiscussionMode;
  label: string; // 表示名(短)
  tagline: string; // 補足
  desc: string; // 説明
  pointLabel: string; // まとめの箇条書きの見出し
}

// アイデアエーションを軸にした進め方
export const MODES: ModeDef[] = [
  {
    id: "diverge",
    label: "発散",
    tagline: "ブレスト",
    desc: "判断は保留し、量と新規性を重視。互いの案に乗って広げる",
    pointLabel: "出たアイデア",
  },
  {
    id: "critique",
    label: "批判",
    tagline: "レッドチーム",
    desc: "各案の弱点・リスク・隠れた前提を突く",
    pointLabel: "リスク・論点",
  },
  {
    id: "converge",
    label: "収束",
    tagline: "選別・統合",
    desc: "出た案を評価し、有望なものを選び・束ねる",
    pointLabel: "有望案",
  },
  {
    id: "debate",
    label: "討論",
    tagline: "自由討論",
    desc: "立場から論じ合う(従来)",
    pointLabel: "論点",
  },
];

export const modeById: Record<DiscussionMode, ModeDef> = Object.fromEntries(
  MODES.map((m) => [m.id, m])
) as Record<DiscussionMode, ModeDef>;
