import { useEffect, useRef } from "react";
import type { Persona, Utterance } from "../types";

export function Transcript({
  personas,
  utterances,
  typingPersona,
}: {
  personas: Record<string, Persona>;
  utterances: Utterance[];
  typingPersona: Persona | null;
}) {
  const endRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [utterances.length, typingPersona]);

  let lastRound = 0;

  return (
    <main className="transcript">
      {utterances.length === 0 && !typingPersona && (
        <div className="transcript__empty">
          <p>▶ 再生 で会議が始まります</p>
        </div>
      )}

      {utterances.map((u) => {
        const p = personas[u.personaId];
        const showRound = u.round !== lastRound;
        lastRound = u.round;
        const moderator = p.id === "moderator";
        return (
          <div key={u.id}>
            {showRound && (
              <div className="round-sep">
                <span>第 {u.round} ラウンド</span>
              </div>
            )}
            <div
              className={"bubble" + (moderator ? " bubble--mod" : "")}
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

      {typingPersona && (
        <div
          className="bubble bubble--typing"
          style={{ ["--accent" as string]: typingPersona.color }}
        >
          <span
            className="bubble__avatar"
            style={{ background: typingPersona.color }}
          >
            {typingPersona.initial}
          </span>
          <div className="bubble__body">
            <div className="bubble__head">
              <span className="bubble__name">{typingPersona.name}</span>
              <span className="bubble__title">思案中…</span>
            </div>
            <div className="typing">
              <span />
              <span />
              <span />
            </div>
          </div>
        </div>
      )}

      <div ref={endRef} />
    </main>
  );
}
