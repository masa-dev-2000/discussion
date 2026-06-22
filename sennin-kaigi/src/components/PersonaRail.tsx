import type { Persona } from "../types";

export function PersonaRail({
  personas,
  activeId,
}: {
  personas: Persona[];
  activeId: string | null;
}) {
  return (
    <aside className="rail">
      <h2 className="rail__title">列席者</h2>
      <ul className="rail__list">
        {personas.map((p) => {
          const active = p.id === activeId;
          return (
            <li
              key={p.id}
              className={"pcard" + (active ? " pcard--active" : "")}
              style={{ ["--accent" as string]: p.color }}
            >
              <span className="pcard__avatar" style={{ background: p.color }}>
                {p.initial}
              </span>
              <span className="pcard__meta">
                <span className="pcard__name">{p.name}</span>
                <span className="pcard__title">{p.title}</span>
              </span>
              {active && <span className="pcard__pulse" />}
            </li>
          );
        })}
      </ul>
    </aside>
  );
}
