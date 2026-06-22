import { useState } from "react";
import type { Discussion } from "../types";
import { personaById } from "../data/personas";
import { navigate } from "../router";
import { SummaryModal } from "../components/SummaryModal";

const STATUS_LABEL: Record<string, string> = {
  draft: "下書き",
  running: "進行中",
  done: "完了",
};

export function DiscussionList({ discussions }: { discussions: Discussion[] }) {
  const [openId, setOpenId] = useState<string | null>(null);
  const open = discussions.find((d) => d.id === openId) ?? null;

  return (
    <section className="page">
      <div className="page__head">
        <h2 className="page__title">議論一覧</h2>
        <button className="btn btn--primary" onClick={() => navigate("/setup")}>
          ＋ 新しい議論
        </button>
      </div>

      <ul className="dlist">
        {discussions.map((d) => (
          <li key={d.id} className="dcard" onClick={() => navigate(`/d/${d.id}`)}>
            <div className="dcard__main">
              <div className="dcard__topline">
                <span className={`badge badge--${d.status}`}>
                  {STATUS_LABEL[d.status]}
                </span>
                <span className="dcard__date">{d.createdAt}</span>
              </div>
              <h3 className="dcard__topic">{d.topic}</h3>
              <p className="dcard__goal">{d.goal || "（ゴール未設定）"}</p>
            </div>
            <div className="dcard__foot">
              <div className="avstack">
                {d.participantIds.slice(0, 6).map((id) => {
                  const p = personaById[id];
                  if (!p) return null;
                  return (
                    <span
                      key={id}
                      className="avstack__a"
                      style={{ background: p.color }}
                      title={p.name}
                    >
                      {p.initial}
                    </span>
                  );
                })}
              </div>
              <span className="dcard__meta">
                {d.participantIds.length}名 ・ {d.rounds}ラウンド
              </span>
              <button
                className="btn btn--mini"
                disabled={!d.summary}
                title={d.summary ? "流れのまとめを見る" : "まだ要約はありません"}
                onClick={(e) => {
                  e.stopPropagation();
                  setOpenId(d.id);
                }}
              >
                要約
              </button>
            </div>
          </li>
        ))}
      </ul>

      {open && <SummaryModal discussion={open} onClose={() => setOpenId(null)} />}
    </section>
  );
}
