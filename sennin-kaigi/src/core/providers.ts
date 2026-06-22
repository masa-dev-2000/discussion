import type { ProviderConfig, ProviderKind } from "./settings";

export interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface StreamOpts {
  signal?: AbortSignal;
  temperature?: number;
  personaName?: string; // mock の口調用ヒント
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

// Tauri 上では Rust 側の HTTP(CORS の制約を受けない)を使う。
// ブラウザ(dev/プレビュー)では通常の fetch にフォールバック。
async function httpFetch(
  url: string,
  init: RequestInit & { signal?: AbortSignal }
): Promise<Response> {
  if (typeof window !== "undefined" && "__TAURI_INTERNALS__" in window) {
    const { fetch: tauriFetch } = await import("@tauri-apps/plugin-http");
    return tauriFetch(url, init) as unknown as Response;
  }
  return fetch(url, init);
}

/**
 * OpenAI 互換の /chat/completions を SSE で叩き、本文デルタを順に yield する。
 * local(LM Studio / Ollama) と api(OpenAI 互換) はこの実装を共有。
 * mock はネット不要のデモ用。
 */
export async function* streamChat(
  kind: ProviderKind,
  cfg: ProviderConfig,
  messages: ChatMessage[],
  opts: StreamOpts = {}
): AsyncGenerator<string> {
  if (kind === "mock") {
    yield* mockStream(messages, opts);
    return;
  }

  const res = await httpFetch(`${cfg.baseUrl.replace(/\/$/, "")}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(cfg.apiKey ? { Authorization: `Bearer ${cfg.apiKey}` } : {}),
    },
    body: JSON.stringify({
      model: cfg.model,
      messages,
      stream: true,
      temperature: opts.temperature ?? 0.8,
    }),
    signal: opts.signal,
  });

  if (!res.ok || !res.body) {
    const detail = await res.text().catch(() => "");
    throw new Error(`LLM 応答エラー: HTTP ${res.status} ${detail.slice(0, 200)}`);
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buf = "";

  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    buf += decoder.decode(value, { stream: true });
    const lines = buf.split("\n");
    buf = lines.pop() ?? "";
    for (const line of lines) {
      const t = line.trim();
      if (!t.startsWith("data:")) continue;
      const data = t.slice(5).trim();
      if (data === "[DONE]") return;
      try {
        const json = JSON.parse(data);
        const delta: string | undefined = json.choices?.[0]?.delta?.content;
        if (delta) yield delta;
      } catch {
        /* keep-alive 行などは無視 */
      }
    }
  }
}

/* ---------------- mock(デモ)プロバイダ ---------------- */

const MOCK_LINES: Record<string, string[]> = {
  ソクラテス: [
    "まず問おう。その言葉で我々は何を指しているのか。定義が揺らいでは、是非も揺らぐ。",
    "君は自明と言うが、本当にそうか。一段問い返せば、足場は案外もろいものだ。",
  ],
  プラトン: [
    "感覚に映るものは影にすぎぬ。背後にある不変のイデアこそ、論ずべき実在だ。",
  ],
  アリストテレス: [
    "観察から始めよ。事物を類と種に分かてば、混沌は秩序へと変わる。",
    "中庸を見よ。極端のいずれにも真理の全体はない。",
  ],
  デカルト: [
    "まず疑え。疑い得ぬものだけを礎とせよ。我思う、ゆえに我あり。",
  ],
  カント: [
    "秩序は世界の側にあるのではない。我々の悟性がそう構成するのだ。物自体と現象を混同してはならぬ。",
  ],
  ヘーゲル: [
    "対立を恐れるな。正と反のせめぎ合いを通じてこそ、概念は高次へと展開する。",
  ],
  ニーチェ: [
    "ふん、いずれも臆病だ。秩序とは弱き者が混沌に架けた檻にすぎぬ。価値は創るものだ。",
  ],
  仏陀: [
    "固定した実体などない。すべては縁って起こり、移ろう。執着を解けば、対立も和らぐ。",
  ],
  老子: [
    "為さずして為す。区別を捨て、流れに従えば、争いは自ずと消える。",
  ],
  孔子: [
    "礼と仁にかえりみよ。秩序とは人の徳から生まれ、強いるものではない。",
  ],
  司会: [
    "では始めよう。各位、忌憚なく己の立場から論じられよ。",
    "論点が見えてきた。ここまでを一度整理し、次へ進もう。",
  ],
};

async function* mockStream(
  messages: ChatMessage[],
  opts: StreamOpts
): AsyncGenerator<string> {
  const last = messages[messages.length - 1]?.content ?? "";

  // 要約リクエストには JSON を返す
  if (last.includes("要約せよ") || last.includes("JSON")) {
    const json =
      '{"summary":"先人たちは立場を異にしつつ、議題の核心を「対象そのものの性質か、認識する側の枠組みか」へと収束させ、有用性と真理性を分けて捉える方向で暫定的に折り合った。","keyPoints":["論点は対象の側か認識の側か","実在論と批判哲学の対立","有用性と真理性の区別","固定した実体への懐疑","暫定合意: 立場の差を残したまま共通の足場を確認"]}';
    for (const ch of json) {
      if (opts.signal?.aborted) return;
      yield ch;
      await sleep(4);
    }
    return;
  }

  const system = messages[0]?.content ?? "";
  const pool = MOCK_LINES[opts.personaName ?? ""] ?? [
    "私の立場から言えば、その見方には与しかねる。理由を述べよう。",
  ];
  // 司会は開会/閉会で台詞を出し分ける
  let text: string;
  if (opts.personaName === "司会") {
    text = system.includes("会を締めよ") ? pool[1] ?? pool[0] : pool[0];
  } else {
    text = pool[Math.floor(Math.random() * pool.length)];
  }
  // 思案の間
  await sleep(350);
  for (const ch of text) {
    if (opts.signal?.aborted) return;
    yield ch;
    await sleep(22);
  }
}
