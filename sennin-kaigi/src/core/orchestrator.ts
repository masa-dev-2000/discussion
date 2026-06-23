import type { Discussion, Persona, Utterance } from "../types";
import { MODERATOR, personaById } from "../data/personas";
import { streamChat, type ChatMessage } from "./providers";
import { resolveProvider, type Settings } from "./settings";

export interface RunHandlers {
  onStart?: (persona: Persona, round: number) => void; // 発言開始(思案中)
  onToken?: (text: string) => void; // ストリームの1片
  onUtterance?: (u: Utterance) => void; // 1発言の確定
  drainInjections?: () => string[]; // 溜まっている観察者の割り込みを取り出す
}

export interface RunOptions {
  initialTranscript?: Utterance[]; // 既存ログから続ける(再開・追記)
  addRounds?: number; // 追記時に足すラウンド数
}

function personaSystem(p: Persona, d: Discussion): string {
  return [
    `あなたは「${p.name}」(${p.title})です。${p.prompt}`,
    `いま「先人会議」という討論の場にいる。`,
    `議題: ${d.topic}`,
    d.goal ? `この会のゴール: ${d.goal}` : "",
    `ルール: 日本語で3〜5文。自分の立場から、直前の発言に具体的に反論または応答せよ。`,
    `安易に同意せず、少なくとも自分の核心は譲るな。前置きや自己紹介は不要、中身から話せ。`,
  ]
    .filter(Boolean)
    .join("\n");
}

function moderatorSystem(d: Discussion, phase: "open" | "close"): string {
  const base = `あなたは「司会」です。${MODERATOR.prompt}\n議題: ${d.topic}`;
  if (phase === "open") {
    return `${base}\nいまから討論を開く。議題を一言で示し、列席者に忌憚なく論じるよう促せ。2〜3文。`;
  }
  return `${base}\nここまでの討論を踏まえ、対立点と一致点を一言で整理し、会を締めよ。2〜3文。`;
}

function buildUserMessage(p: Persona, transcript: Utterance[]): string {
  const log = transcript.length
    ? transcript
        .map((u) => `【${personaById[u.personaId]?.name ?? "?"}】${u.text}`)
        .join("\n\n")
    : "（まだ誰も発言していない）";
  return `これまでの発言:\n${log}\n\nあなた（${p.name}）の番だ。直前の流れを踏まえ、1ターン述べよ。`;
}

/**
 * 会議を実行。各発言をストリームしながら handlers に通知する。
 * 人物ごとに接続先(モデル)を解決する。
 * abort された場合は AbortError が投げられる(呼び出し側で握る)。
 */
export async function runDiscussion(
  settings: Settings,
  discussion: Discussion,
  handlers: RunHandlers,
  signal: AbortSignal,
  opts: RunOptions = {}
): Promise<Utterance[]> {
  const participants = discussion.participantIds
    .map((id) => personaById[id])
    .filter(Boolean) as Persona[];

  const seed = opts.initialTranscript ?? [];
  const isContinue = seed.length > 0;
  const transcript: Utterance[] = [...seed];
  const stamp = Date.now().toString(36);
  let uid = 0;

  const startRound = isContinue
    ? Math.max(...seed.map((u) => u.round)) + 1
    : 1;
  const rounds = opts.addRounds ?? discussion.rounds;

  const speak = async (persona: Persona, round: number, system: string) => {
    if (signal.aborted) throw new DOMException("aborted", "AbortError");
    handlers.onStart?.(persona, round);
    const { kind, cfg } = resolveProvider(settings, persona.id);
    const messages: ChatMessage[] = [
      { role: "system", content: system },
      { role: "user", content: buildUserMessage(persona, transcript) },
    ];
    let acc = "";
    for await (const tok of streamChat(kind, cfg, messages, {
      signal,
      personaName: persona.name,
    })) {
      acc += tok;
      handlers.onToken?.(tok);
    }
    const u: Utterance = {
      id: `g${stamp}-${uid++}`,
      personaId: persona.id,
      round,
      text: acc.trim(),
    };
    transcript.push(u);
    handlers.onUtterance?.(u);
  };

  // 観察者(ユーザー)の割り込みを発言として挿入する
  const flushObserver = (round: number) => {
    const texts = handlers.drainInjections?.() ?? [];
    for (const text of texts) {
      const u: Utterance = {
        id: `obs${stamp}-${uid++}`,
        personaId: "observer",
        round,
        text,
      };
      transcript.push(u);
      handlers.onUtterance?.(u);
    }
  };

  // 新規のときだけ開会の辞
  if (!isContinue) {
    await speak(MODERATOR, 1, moderatorSystem(discussion, "open"));
  }

  for (let i = 0; i < rounds; i++) {
    const r = startRound + i;
    for (const p of participants) {
      flushObserver(r); // 次の登壇者の前に割り込みを差し込む
      await speak(p, r, personaSystem(p, discussion));
    }
  }
  flushObserver(startRound + rounds - 1);

  // 新規のときだけ閉会の辞(追記時は二重に締めない)
  if (!isContinue) {
    await speak(MODERATOR, startRound + rounds - 1, moderatorSystem(discussion, "close"));
  }

  return transcript;
}

export interface SummaryResult {
  summary: string;
  keyPoints: string[];
}

/** 議論ログから要約(本文+論点)を生成する。司会のモデルを用いる。 */
export async function summarizeDiscussion(
  settings: Settings,
  discussion: Discussion,
  transcript: Utterance[],
  signal: AbortSignal
): Promise<SummaryResult> {
  const { kind, cfg } = resolveProvider(settings, "moderator");
  const log = transcript
    .map((u) => `【${personaById[u.personaId]?.name ?? "?"}】${u.text}`)
    .join("\n");

  const messages: ChatMessage[] = [
    { role: "system", content: "あなたは討論の書記。立場に偏らず公平に要約する。" },
    {
      role: "user",
      content:
        `次の討論を要約せよ。\n議題: ${discussion.topic}\n\n${log}\n\n` +
        `出力は次の JSON のみ(前後に文章を付けない):\n` +
        `{"summary":"150字程度の要約","keyPoints":["論点を最大5つ"]}`,
    },
  ];

  let acc = "";
  for await (const tok of streamChat(kind, cfg, messages, { signal, temperature: 0.3 })) {
    acc += tok;
  }

  const match = acc.match(/\{[\s\S]*\}/);
  if (!match) {
    return { summary: acc.trim().slice(0, 200), keyPoints: [] };
  }
  try {
    const obj = JSON.parse(match[0]);
    return {
      summary: String(obj.summary ?? "").trim(),
      keyPoints: Array.isArray(obj.keyPoints)
        ? obj.keyPoints.map((k: unknown) => String(k)).slice(0, 5)
        : [],
    };
  } catch {
    return { summary: acc.trim().slice(0, 200), keyPoints: [] };
  }
}
