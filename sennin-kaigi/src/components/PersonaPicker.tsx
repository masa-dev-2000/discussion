import type { Persona } from "../types";

function Chip({
  p,
  on,
  onToggle,
}: {
  p: Persona;
  on: boolean;
  onToggle: (id: string) => void;
}) {
  return (
    <button
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
}

export function PersonaPicker({
  catalog,
  selected,
  onToggle,
}: {
  catalog: Persona[];
  selected: string[];
  onToggle: (id: string) => void;
}) {
  const roles = catalog.filter((p) => p.group === "role");
  const thinkers = catalog.filter((p) => p.group !== "role");

  return (
    <div className="picker-groups">
      <div className="picker__group">
        <span className="picker__grouphead">発想ロール</span>
        <div className="picker">
          {roles.map((p) => (
            <Chip key={p.id} p={p} on={selected.includes(p.id)} onToggle={onToggle} />
          ))}
        </div>
      </div>
      <div className="picker__group">
        <span className="picker__grouphead">思想家</span>
        <div className="picker">
          {thinkers.map((p) => (
            <Chip key={p.id} p={p} on={selected.includes(p.id)} onToggle={onToggle} />
          ))}
        </div>
      </div>
    </div>
  );
}
