import { useEffect } from "react";
import type { Discussion } from "../types";

export function SummaryModal({
  discussion,
  onClose,
}: {
  discussion: Discussion;
  onClose: () => void;
}) {
  useEffect(() => {
    const on = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", on);
    return () => window.removeEventListener("keydown", on);
  }, [onClose]);

  return (
    <div className="modal" onClick={onClose}>
      <div className="modal__panel" onClick={(e) => e.stopPropagation()}>
        <div className="modal__head">
          <h3 className="modal__title">流れのまとめ</h3>
          <button className="modal__close" onClick={onClose} aria-label="閉じる">
            ×
          </button>
        </div>
        <p className="modal__topic">{discussion.topic}</p>

        {discussion.summary ? (
          <>
            <p className="summary__text">{discussion.summary}</p>
            {discussion.keyPoints.length > 0 && (
              <ul className="summary__points">
                {discussion.keyPoints.map((k, i) => (
                  <li key={i}>{k}</li>
                ))}
              </ul>
            )}
          </>
        ) : (
          <p className="summary__empty muted">
            まだ要約はありません。議論が進むと生成されます。
          </p>
        )}
      </div>
    </div>
  );
}
