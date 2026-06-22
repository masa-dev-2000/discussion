import { useEffect, useMemo, useRef, useState } from "react";
import { PERSONAS, UTTERANCES, TOPIC } from "./data/mock";
import type { Persona, Provider } from "./types";
import { PersonaRail } from "./components/PersonaRail";
import { Transcript } from "./components/Transcript";
import { TopicBar } from "./components/TopicBar";
import { Controls } from "./components/Controls";

const STEP_MS = 1700; // 1発言ごとの間合い(モック演出)

export default function App() {
  const personaMap = useMemo(
    () => Object.fromEntries(PERSONAS.map((p) => [p.id, p])) as Record<string, Persona>,
    []
  );

  const [revealed, setRevealed] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [provider, setProvider] = useState<Provider>("local");
  const timer = useRef<number | null>(null);

  const shown = UTTERANCES.slice(0, revealed);
  const done = revealed >= UTTERANCES.length;
  const nextSpeaker = !done ? personaMap[UTTERANCES[revealed].personaId] : null;
  const lastSpeakerId = shown.length ? shown[shown.length - 1].personaId : null;
  const currentRound = shown.length ? shown[shown.length - 1].round : 0;

  // 再生中は「次に話す人」を、停止中は「直前に話した人」をハイライト
  const railActive = playing && nextSpeaker ? nextSpeaker.id : lastSpeakerId;

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

  return (
    <div className="app">
      <header className="app__header">
        <div className="app__brand">
          <span className="app__seal">會</span>
          <div>
            <h1 className="app__title">先人会議</h1>
            <p className="app__sub">Council of the Ancients — 時を超えた知性の討論</p>
          </div>
        </div>
      </header>

      <TopicBar
        topic={TOPIC}
        round={currentRound}
        provider={provider}
        onProvider={setProvider}
      />

      <div className="app__main">
        <PersonaRail personas={PERSONAS} activeId={railActive} />
        <Transcript
          personas={personaMap}
          utterances={shown}
          typingPersona={playing ? nextSpeaker : null}
        />
      </div>

      <Controls
        playing={playing}
        done={done}
        atStart={revealed === 0}
        onPlay={() => setPlaying((v) => !v)}
        onStep={() => setRevealed((r) => Math.min(r + 1, UTTERANCES.length))}
        onReset={() => {
          setPlaying(false);
          setRevealed(0);
        }}
      />
    </div>
  );
}
