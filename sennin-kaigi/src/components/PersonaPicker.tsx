import type { Persona } from "../types";

export function PersonaPicker({
  catalog,
  selected,
  onToggle,
}: {
  catalog: Persona[];
  selected: string[];
  onToggle: (id: string) => void;
}) {
  return (
    <div className="picker">
      {catalog.map((p) => {
        const on = selected.includes(p.id);
        return (
          <button
            key={p.id}
            type="button"
            className={"chip" + (on ? " chip--on" : "")}
            style={{ ["--accent" as string]: p.color }}
            onClick={() => onToggle(p.id)}
          >
            <span className="chip__avatar" style={{ background: p.color }}>
              {p.initial}
            </span>
            <span className="chip__meta">
              <span className="chip__name">{p.name}</span>
              <span className="chip__title">{p.title}</span>
            </span>
            <span className="chip__check">{on ? "✓" : ""}</span>
          </button>
        );
      })}
    </div>
  );
}
