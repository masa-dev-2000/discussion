import type { Discussion } from "../types";
import { SEED_DISCUSSIONS } from "../data/discussions";

// 議論の永続化。
// - Tauri: Store プラグインでアプリのデータディレクトリに JSON ファイル保存
// - ブラウザ: localStorage
const FILE = "discussions.json";
const STORE_KEY = "discussions";
const LS_KEY = "sennin.discussions";

const isTauri = () =>
  typeof window !== "undefined" && "__TAURI_INTERNALS__" in window;

// 進行中のまま閉じた議論は、読込時に整合させる
function normalize(list: Discussion[]): Discussion[] {
  return list.map((d) => {
    const mode = d.mode ?? "debate"; // 旧データは討論扱い
    return d.status === "running"
      ? { ...d, mode, status: d.utterances.length ? "done" : "draft" }
      : { ...d, mode };
  });
}

export async function loadDiscussions(): Promise<Discussion[]> {
  try {
    if (isTauri()) {
      const { load } = await import("@tauri-apps/plugin-store");
      const store = await load(FILE, { defaults: {}, autoSave: false });
      const v = await store.get<Discussion[]>(STORE_KEY);
      return v && Array.isArray(v) ? normalize(v) : SEED_DISCUSSIONS;
    }
    const raw = localStorage.getItem(LS_KEY);
    if (raw === null) return SEED_DISCUSSIONS; // 初回はシード
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? normalize(parsed) : SEED_DISCUSSIONS;
  } catch {
    return SEED_DISCUSSIONS;
  }
}

export async function saveDiscussions(list: Discussion[]): Promise<void> {
  try {
    if (isTauri()) {
      const { load } = await import("@tauri-apps/plugin-store");
      const store = await load(FILE, { defaults: {}, autoSave: false });
      await store.set(STORE_KEY, list);
      await store.save();
      return;
    }
    localStorage.setItem(LS_KEY, JSON.stringify(list));
  } catch {
    /* 容量超過などは無視 */
  }
}
