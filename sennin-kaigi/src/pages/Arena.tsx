import { useEffect, useState } from "react";
import type { Discussion, Persona } from "../types";
import { personaById, MODERATOR } from "../data/personas";
import { Transcript, type StreamingState } from "../components/Transcript";
import { ParticipantStrip } from "../components/ParticipantStrip";
import { SettingsModal } from "../components/SettingsModal";
import { ModelAssignModal } from "../components/ModelAssignModal";
import { PROVIDER_LABEL, PROVIDER_KINDS, type Settings } from "../core/settings";
import { modeById } from "../data/modes";
import { useRuns } from "../core/runs";

export function Arena({
  discussion,
  settings,
  setSettings,
}: {
  discussion: Discussion;
  settings: Settings;
  setSettings: (s: Settings) => void;
}) {
  const {
    runs,
    errors,
    start,
    stop,
    interject,
    canStart,
    checkHealth,
    health,
    healthError,
    activeCount,
    maxConcurrent,
  } = useRuns();
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [assignOpen, setAssignOpen] = useState(false);
  const [draft, setDraft] = useState("");

  // 入室時に接続を確認
  useEffect(() => {
    checkHealth();
  }, [checkHealth]);

  const participants: Persona[] = [
    MODERATOR,
    ...discussion.participantIds.map((id) => personaById[id]).filter(Boolean),
  ];

  const run = runs[discussion.id];
  const running = !!run;
  const streaming: StreamingState | null =
    run?.streaming && personaById[run.streaming.personaId]
      ? { persona: personaById[run.streaming.personaId], text: run.streaming.text }
      : null;
  const error = errors[discussion.id];
  const hasLog = discussion.utterances.length > 0;

  const providerDown = settings.active !== "mock" && health === "down";
  const slotsFull = !running && activeCount >= maxConcurrent;
  const startable = canStart(discussion.id);

  return (
    <section className="arena">
      <div className="arena__head">
        <a className="link" href="#/">
          ← 一覧へ
        </a>
        <div className="arena__tools">
          {activeCount > 0 && (
            <span className="roundchip">
              実行中 {activeCount} / {maxConcurrent}
            </span>
          )}
          <div className="seg" role="group" aria-label="接続先">
            {PROVIDER_KINDS.map((k) => (
              <button
                key={k}
                className={"seg__btn" + (settings.active === k ? " seg__btn--on" : "")}
                onClick={() => setSettings({ ...settings, active: k })}
                disabled={running}
              >
                {PROVIDER_LABEL[k]}
              </button>
            ))}
          </div>
          <button
            className="iconbtn"
            title="モデル割当(人物ごと)"
            onClick={() => setAssignOpen(true)}
            disabled={running}
          >
            ⚖
          </button>
          <button className="iconbtn" title="接続設定" onClick={() => setSettingsOpen(true)}>
            ⚙
          </button>
        </div>
      </div>

      <div className="arena__topic">
        <div className="arena__titlerow">
          <h2 className="arena__title">{discussion.topic}</h2>
          <span className="modechip">{modeById[discussion.mode]?.label ?? "討論"}</span>
        </div>
        <p className="arena__goal">
          <span className="tag">ゴール</span>
          {discussion.goal || "（未設定）"}
        </p>
        <ParticipantStrip personas={participants} />
      </div>

      <div className="arena__body">
        <div className="arena__chat">
          <Transcript
            personas={personaById}
            utterances={discussion.utterances}
            streaming={streaming}
          />
        </div>
      </div>

      <form
        className="interject"
        onSubmit={(e) => {
          e.preventDefault();
          const t = draft.trim();
          if (!t) return;
          interject(discussion.id, t);
          setDraft("");
        }}
      >
        <input
          className="interject__input"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder={
            running
              ? "口を挟む…(次の発言の前に差し込まれます)"
              : hasLog
                ? "口を挟む…(『続きを1ラウンド』で先人が反応します)"
                : "口を挟む…(観察者として記録)"
          }
        />
        <button className="btn btn--ghost" type="submit" disabled={!draft.trim()}>
          差し込む
        </button>
      </form>

      {error && <div className="errbar">⚠ {error}</div>}
      {providerDown && !running && (
        <div className="errbar">
          ⚠ Ollama に接続できません{healthError ? `（${healthError}）` : ""}。⚙ で接続を確認するか、デモに切り替えてください。
        </div>
      )}

      <div className="runbar">
        {running ? (
          <>
            <button className="btn btn--danger" onClick={() => stop(discussion.id)}>
              ■ 停止
            </button>
            <span className="running-note">
              {run.phase === "summarizing" ? "要約を生成中…" : "議論を進行中…"}
            </span>
          </>
        ) : (
          <>
            <button
              className="btn btn--primary"
              onClick={() => start(discussion.id, "fresh")}
              disabled={!startable}
            >
              {hasLog ? "↻ 再実行" : "▶ 議論を開始"}
            </button>
            {hasLog && (
              <button
                className="btn btn--ghost"
                onClick={() => start(discussion.id, "continue")}
                disabled={!startable}
              >
                ↳ 続きを1ラウンド
              </button>
            )}
            {slotsFull && !providerDown && (
              <span className="running-note">
                実行枠が埋まっています（同時 {maxConcurrent} 件まで）
              </span>
            )}
          </>
        )}
      </div>

      {settingsOpen && (
        <SettingsModal
          settings={settings}
          onSave={setSettings}
          onClose={() => {
            setSettingsOpen(false);
            checkHealth();
          }}
        />
      )}
      {assignOpen && (
        <ModelAssignModal
          personas={participants}
          settings={settings}
          onSave={setSettings}
          onClose={() => setAssignOpen(false)}
        />
      )}
    </section>
  );
}
