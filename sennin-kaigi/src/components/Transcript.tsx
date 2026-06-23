import { useEffect, useRef, useState } from "react";
import type { Persona, Utterance } from "../types";

export interface StreamingState {
  persona: Persona;
  text: string; // ここまで届いた本文(空なら思案中)
}

export function Transcript({
  personas,
  utterances,
  streaming,
}: {
  personas: Record<string, Persona>;
  utterances: Utterance[];
  streaming: StreamingState | null;
}) {
  const scrollRef = useRef<HTMLElement>(null);
  const [atBottom, setAtBottom] = useState(true);

  const updateAtBottom = () => {
    const el = scrollRef.current;
    if (!el) return;
    setAtBottom(el.scrollHeight - el.scrollTop - el.clientHeight < 40);
  };

  // 自動スクロールはしない。新着で最下部判定だけ更新(ボタンの出し分け用)
  useEffect(() => {
    updateAtBottom();
  }, [utterances.length, streaming?.text]);

  const jumpToBottom = () => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
    setAtBottom(true);
  };

  let lastRound = 0;

  return (
    <div className="transcript-wrap">
      <main className="transcript" ref={scrollRef} onScroll={updateAtBottom}>
        {utterances.length === 0 && !streaming && (
          <div className="transcript__empty">
            <p>▶ 議論を開始 で会議が始まります</p>
          </div>
        )}

        {utterances.map((u) => {
          const p = personas[u.personaId];
          const showRound = u.round !== lastRound;
          lastRound = u.round;
          const moderator = p.id === "moderator";
          const observer = p.id === "observer";
          return (
            <div key={u.id}>
              {showRound && (
                <div className="round-sep">
                  <span>第 {u.round} ラウンド</span>
                </div>
              )}
              <div
                className={
                  "bubble" +
                  (moderator ? " bubble--mod" : "") +
                  (observer ? " bubble--observer" : "")
                }
                style={{ ["--accent" as string]: p.color }}
              >
                {!moderator && (
                  <span className="bubble__avatar" style={{ background: p.color }}>
                    {p.initial}
                  </span>
                )}
                <div className="bubble__body">
                  <div className="bubble__head">
                    <span className="bubble__name">{p.name}</span>
                    <span className="bubble__title">{p.title}</span>
                  </div>
                  <p className="bubble__text">{u.text}</p>
                </div>
              </div>
            </div>
          );
        })}

        {streaming && (
          <div
            className={
              "bubble" + (streaming.persona.id === "moderator" ? " bubble--mod" : "")
            }
            style={{ ["--accent" as string]: streaming.persona.color }}
          >
            {streaming.persona.id !== "moderator" && (
              <span
                className="bubble__avatar"
                style={{ background: streaming.persona.color }}
              >
                {streaming.persona.initial}
              </span>
            )}
            <div className="bubble__body">
              <div className="bubble__head">
                <span className="bubble__name">{streaming.persona.name}</span>
                <span className="bubble__title">発言中…</span>
              </div>
              {streaming.text ? (
                <p className="bubble__text">
                  {streaming.text}
                  <span className="caret" />
                </p>
              ) : (
                <div className="typing">
                  <span />
                  <span />
                  <span />
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {!atBottom && (
        <button className="jumpdown" onClick={jumpToBottom} title="最新へ">
          ↓ 最新へ
        </button>
      )}
    </div>
  );
}
