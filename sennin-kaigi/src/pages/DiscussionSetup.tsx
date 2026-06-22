import { useState } from "react";
import { CATALOG } from "../data/personas";
import { PersonaPicker } from "../components/PersonaPicker";

export interface NewDiscussionInput {
  topic: string;
  goal: string;
  rounds: number;
  participantIds: string[];
}

export function DiscussionSetup({
  onCreate,
}: {
  onCreate: (input: NewDiscussionInput) => void;
}) {
  const [topic, setTopic] = useState("");
  const [goal, setGoal] = useState("");
  const [rounds, setRounds] = useState(3);
  const [selected, setSelected] = useState<string[]>([]);

  const toggle = (id: string) =>
    setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));

  const valid = topic.trim().length > 0 && selected.length >= 2;

  return (
    <section className="page">
      <div className="page__head">
        <h2 className="page__title">議論設定</h2>
        <a className="link" href="#/">
          ← 一覧へ
        </a>
      </div>

      <div className="form">
        <label className="field">
          <span className="field__label">テーマ</span>
          <input
            className="field__input"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="例: 世界は本当に MECE に分類できるか?"
          />
        </label>

        <label className="field">
          <span className="field__label">ゴール</span>
          <textarea
            className="field__area"
            value={goal}
            onChange={(e) => setGoal(e.target.value)}
            rows={3}
            placeholder="この議論で何を明らかにしたいか"
          />
        </label>

        <label className="field field--inline">
          <span className="field__label">ラウンド数</span>
          <input
            type="number"
            min={1}
            max={10}
            className="field__num"
            value={rounds}
            onChange={(e) => setRounds(Number(e.target.value))}
          />
        </label>

        <div className="field">
          <span className="field__label">
            対話者 <span className="field__hint">（2名以上）</span>
          </span>
          <PersonaPicker catalog={CATALOG} selected={selected} onToggle={toggle} />
          <span className="field__note">司会は自動で同席します。</span>
        </div>

        <div className="form__actions">
          <a className="btn btn--ghost" href="#/">
            キャンセル
          </a>
          <button
            className="btn btn--primary"
            disabled={!valid}
            onClick={() =>
              onCreate({
                topic: topic.trim(),
                goal: goal.trim(),
                rounds,
                participantIds: selected,
              })
            }
          >
            この内容で開く
          </button>
        </div>
      </div>
    </section>
  );
}
