import type { Discussion } from "../types";
import { SEED_DISCUSSIONS } from "../data/discussions";

// 議論の永続化。localStorage を使う(Tauri の webview でもディスクに永続化される)。
const KEY = "sennin.discussions";

// 進行中のまま閉じた議論は、再読込時に整合させる
function normalize(list: Discussion[]): Discussion[] {
  return list.map((d) =>
    d.status === "running"
      ? { ...d, status: d.utterances.length ? "done" : "draft" }
      : d
  );
}

export function loadDiscussions(): Discussion[] {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw === null) return SEED_DISCUSSIONS; // 初回はシードを表示
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return SEED_DISCUSSIONS;
    return normalize(parsed as Discussion[]);
  } catch {
    return SEED_DISCUSSIONS;
  }
}

export function saveDiscussions(list: Discussion[]) {
  try {
    localStorage.setItem(KEY, JSON.stringify(list));
  } catch {
    /* 容量超過などは無視 */
  }
}
