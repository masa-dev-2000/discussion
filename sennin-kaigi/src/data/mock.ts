import type { Persona, Utterance } from "../types";

// 見た目確認用のモック。後でこの配列を LLM オーケストレーターの出力に差し替える。
export const TOPIC = "世界は本当に MECE に分類できるか?";

export const PERSONAS: Persona[] = [
  { id: "moderator", name: "司会", title: "進行・収束", color: "#c8a86a", initial: "司" },
  { id: "socrates", name: "ソクラテス", title: "前提を問う者", color: "#6ea8c8", initial: "ソ" },
  { id: "aristotle", name: "アリストテレス", title: "範疇の祖", color: "#c08457", initial: "ア" },
  { id: "kant", name: "カント", title: "認識の批判者", color: "#8e7bc4", initial: "カ" },
  { id: "buddha", name: "仏陀", title: "無常を説く者", color: "#5fae8e", initial: "仏" },
  { id: "nietzsche", name: "ニーチェ", title: "価値の鎚", color: "#c25b5b", initial: "ニ" },
];

export const UTTERANCES: Utterance[] = [
  {
    id: "u1", round: 1, personaId: "moderator",
    text: "議題は『世界は本当に MECE に分類できるか』。各位、忌憚なく。まずソクラテス殿。",
  },
  {
    id: "u2", round: 1, personaId: "socrates",
    text: "分類する前に問おう。『分類できる』とは何を指すのか。我々が世界を切るのか、世界が初めから切れているのか。その区別なしに是非は語れまい。",
  },
  {
    id: "u3", round: 1, personaId: "aristotle",
    text: "世界は実体とその属性から成る。実体を類と種に分かてば、漏れも重なりもなく秩序立てられる。MECE とはまさに我が範疇論の謂いだ。",
  },
  {
    id: "u4", round: 1, personaId: "kant",
    text: "待たれよ。秩序は世界の側にあるのではない。悟性が世界をそう切るのだ。MECE とは認識の枠であって、物自体の姿ではない。",
  },
  {
    id: "u5", round: 2, personaId: "buddha",
    text: "そもそも固定した実体などない。すべては縁って起こり、移ろう。境界は仮の名にすぎぬ。分類は方便として有用だが、真実と取り違えてはならぬ。",
  },
  {
    id: "u6", round: 2, personaId: "nietzsche",
    text: "ふん、いずれも臆病だ。分類とは力への意志の産物——弱き者が混沌に耐えかね、世界に檻を架けたのだ。MECE とは整然たる牢獄の別名にすぎぬ。",
  },
  {
    id: "u7", round: 2, personaId: "socrates",
    text: "ニーチェよ、ならば問う。檻と知りて、なお我々はなぜ分類をやめられぬのか。",
  },
  {
    id: "u8", round: 3, personaId: "aristotle",
    text: "やめられぬのは、それが有用だからだ。船を造るに材を分かたぬ者はおらぬ。",
  },
  {
    id: "u9", round: 3, personaId: "kant",
    text: "同意しよう。ただし有用と真とを混同せぬことだ。地図は領土ではない。",
  },
  {
    id: "u10", round: 3, personaId: "moderator",
    text: "論点が見えてきた。『世界が分かれているか』ではなく『誰の・何のための分類か』——次のラウンドはここを詰めよう。",
  },
];
