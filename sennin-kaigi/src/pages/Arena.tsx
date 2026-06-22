import { useEffect, useRef, useState } from "react";
import type { Discussion, Provider } from "../types";
import { personaById, MODERATOR } from "../data/personas";
import { Transcript } from "../components/Transcript";
import { Controls } from "../components/Controls";
import { ParticipantStrip } from "../components/ParticipantStrip";

const STEP_MS = 1700; // モック再生の間合い

export function Arena({ discussion }: { discussion: Discussion }) {
  const utts = discussion.utterances;
  const hasLog = utts.length > 0;

  const [revealed, setRevealed] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [provider, setProvider] = useState<Provider>("local");
  const timer = useRef<number | null>(null);

  const shown = utts.slice(0, revealed);
  const done = revealed >= utts.length;
  const next = !done ? personaById[utts[revealed].personaId] : null;

  useEffect(() => {
    if (!playing || done) return;
    timer.current = window.setTimeout(() => setRevealed((r) => r + 1), STEP_MS);
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, [playing, revealed, done]);

  useEffect(() => {
    if (done) setPlaying(false);
  }, [done]);

  const participants = [
    MODERATOR,
    ...discussion.participantIds.map((id) => personaById[id]).filter(Boolean),
  ];

  return (
    <section className="arena">
      <div className="arena__head">
        <a className="link" href="#/">
          ← 一覧へ
        </a>
        <div className="seg" role="group" aria-label="接続先">
          <button
            className={"seg__btn" + (provider === "local" ? " seg__btn--on" : "")}
            onClick={() => setProvider("local")}
          >
            ローカル
          </button>
          <button
            className={"seg__btn" + (provider === "api" ? " seg__btn--on" : "")}
            onClick={() => setProvider("api")}
          >
            API
          </button>
        </div>
      </div>

      <div className="arena__topic">
        <h2 className="arena__title">{discussion.topic}</h2>
        <p className="arena__goal">
          <span className="tag">ゴール</span>
          {discussion.goal || "（未設定）"}
        </p>
        <ParticipantStrip personas={participants} />
      </div>

      <div className="arena__body">
        <div className="arena__chat">
          {hasLog ? (
            <Transcript
              personas={personaById}
              utterances={shown}
              typingPersona={playing ? next : null}
            />
          ) : (
            <div className="transcript transcript--empty">
              <div className="transcript__empty">
                <p>まだ発言がありません。</p>
                <p className="muted">
                  LLM 接続（次のステップ）を入れると、ここに議論が流れます。
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {hasLog && (
        <Controls
          playing={playing}
          done={done}
          atStart={revealed === 0}
          onPlay={() => setPlaying((v) => !v)}
          onStep={() => setRevealed((r) => Math.min(r + 1, utts.length))}
          onReset={() => {
            setPlaying(false);
            setRevealed(0);
          }}
        />
      )}
    </section>
  );
}
