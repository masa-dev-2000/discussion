import type { Persona } from "../types";

export function ParticipantStrip({ personas }: { personas: Persona[] }) {
  return (
    <div className="pstrip">
      {personas.map((p) => (
        <span key={p.id} className="pstrip__item" title={`${p.name}・${p.title}`}>
          <span className="pstrip__avatar" style={{ background: p.color }}>
            {p.initial}
          </span>
          <span className="pstrip__name">{p.name}</span>
        </span>
      ))}
    </div>
  );
}
