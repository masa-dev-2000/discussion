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
  const groups: { head: string; note?: string; items: Persona[] }[] = [
    { head: "発想ロール", items: catalog.filter((p) => p.group === "role") },
    {
      head: "現代の実践者",
      note: "公開された発言・姿勢に基づく作風の再現",
      items: catalog.filter((p) => p.group === "modern"),
    },
    { head: "思想家", items: catalog.filter((p) => p.group === "thinker") },
  ];

  return (
    <div className="picker-groups">
      {groups.map((g) => (
        <div className="picker__group" key={g.head}>
          <span className="picker__grouphead">
            {g.head}
            {g.note && <span className="picker__groupnote"> — {g.note}</span>}
          </span>
          <div className="picker">
            {g.items.map((p) => (
              <Chip key={p.id} p={p} on={selected.includes(p.id)} onToggle={onToggle} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
