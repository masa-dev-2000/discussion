export function Controls({
  playing,
  done,
  atStart,
  onPlay,
  onStep,
  onReset,
}: {
  playing: boolean;
  done: boolean;
  atStart: boolean;
  onPlay: () => void;
  onStep: () => void;
  onReset: () => void;
}) {
  return (
    <footer className="controls">
      <button className="btn btn--ghost" onClick={onReset} disabled={atStart}>
        ↺ リセット
      </button>
      <button className="btn btn--primary" onClick={onPlay} disabled={done}>
        {playing ? "❚❚ 一時停止" : done ? "閉会" : "▶ 再生"}
      </button>
      <button
        className="btn btn--ghost"
        onClick={onStep}
        disabled={done || playing}
      >
        次の発言 →
      </button>
    </footer>
  );
}
