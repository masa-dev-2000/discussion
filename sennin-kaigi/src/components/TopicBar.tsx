import type { Provider } from "../types";

export function TopicBar({
  topic,
  round,
  provider,
  onProvider,
}: {
  topic: string;
  round: number;
  provider: Provider;
  onProvider: (p: Provider) => void;
}) {
  return (
    <div className="topicbar">
      <div className="topicbar__left">
        <span className="topicbar__label">議題</span>
        <span className="topicbar__topic">{topic}</span>
      </div>
      <div className="topicbar__right">
        <span className="roundchip">
          {round > 0 ? `第 ${round} ラウンド` : "開会前"}
        </span>
        <div className="seg" role="group" aria-label="接続先">
          <button
            className={"seg__btn" + (provider === "local" ? " seg__btn--on" : "")}
            onClick={() => onProvider("local")}
          >
            ローカル
          </button>
          <button
            className={"seg__btn" + (provider === "api" ? " seg__btn--on" : "")}
            onClick={() => onProvider("api")}
          >
            API
          </button>
        </div>
      </div>
    </div>
  );
}
