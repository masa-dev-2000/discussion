import type { Discussion } from "../types";

// 見た目確認用の初期データ。後で永続化や LLM 生成に差し替える。
export const SEED_DISCUSSIONS: Discussion[] = [
  {
    id: "mece",
    topic: "世界は本当に MECE に分類できるか?",
    goal: "分類が世界の実相か、人間の道具かを切り分け、暫定的な合意点を出す。",
    participantIds: ["socrates", "aristotle", "kant", "buddha", "nietzsche"],
    rounds: 3,
    status: "done",
    createdAt: "2026-06-21",
    summary:
      "世界を MECE に分類できるかを巡り、実在論(アリストテレス)と認識論的批判(カント)・無常(仏陀)・力への意志(ニーチェ)が対立。議論は『分類は世界の姿か、人の道具か』へ収束し、有用性と真理性を分けて捉える方向で暫定的に一致した。",
    keyPoints: [
      "核心は「分類できるか」より「誰の・何のための分類か」",
      "アリストテレス: 実体の類・種で漏れなく秩序立つ(実在論)",
      "カント/仏陀: 境界は認識の枠・方便であって物自体ではない",
      "ニーチェ: 分類は力への意志=整然たる檻",
      "暫定合意: 有用性と真理性を混同しない(地図は領土ではない)",
    ],
    utterances: [
      { id: "u1", round: 1, personaId: "moderator", text: "議題は『世界は本当に MECE に分類できるか』。各位、忌憚なく。まずソクラテス殿。" },
      { id: "u2", round: 1, personaId: "socrates", text: "分類する前に問おう。『分類できる』とは何を指すのか。我々が世界を切るのか、世界が初めから切れているのか。その区別なしに是非は語れまい。" },
      { id: "u3", round: 1, personaId: "aristotle", text: "世界は実体とその属性から成る。実体を類と種に分かてば、漏れも重なりもなく秩序立てられる。MECE とはまさに我が範疇論の謂いだ。" },
      { id: "u4", round: 1, personaId: "kant", text: "待たれよ。秩序は世界の側にあるのではない。悟性が世界をそう切るのだ。MECE とは認識の枠であって、物自体の姿ではない。" },
      { id: "u5", round: 2, personaId: "buddha", text: "そもそも固定した実体などない。すべては縁って起こり、移ろう。境界は仮の名にすぎぬ。分類は方便として有用だが、真実と取り違えてはならぬ。" },
      { id: "u6", round: 2, personaId: "nietzsche", text: "ふん、いずれも臆病だ。分類とは力への意志の産物——弱き者が混沌に耐えかね、世界に檻を架けたのだ。MECE とは整然たる牢獄の別名にすぎぬ。" },
      { id: "u7", round: 2, personaId: "socrates", text: "ニーチェよ、ならば問う。檻と知りて、なお我々はなぜ分類をやめられぬのか。" },
      { id: "u8", round: 3, personaId: "aristotle", text: "やめられぬのは、それが有用だからだ。船を造るに材を分かたぬ者はおらぬ。" },
      { id: "u9", round: 3, personaId: "kant", text: "同意しよう。ただし有用と真とを混同せぬことだ。地図は領土ではない。" },
      { id: "u10", round: 3, personaId: "moderator", text: "論点が見えてきた。『世界が分かれているか』ではなく『誰の・何のための分類か』——次のラウンドはここを詰めよう。" },
    ],
  },
  {
    id: "ai-mind",
    topic: "AI に意識は宿るか?",
    goal: "「意識」の定義を詰め、機能主義と現象的意識の境界を明らかにする。",
    participantIds: ["descartes", "kant", "buddha"],
    rounds: 3,
    status: "draft",
    createdAt: "2026-06-22",
    summary: "",
    keyPoints: [],
    utterances: [],
  },
];
