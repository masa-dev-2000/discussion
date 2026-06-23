import { useState } from "react";
import {
  PROVIDER_LABEL,
  PROVIDER_KINDS,
  type ProviderConfig,
  type Settings,
} from "../core/settings";
import { listModels } from "../core/providers";

type TestState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "ok"; models: string[] }
  | { status: "err"; error: string };

export function SettingsModal({
  settings,
  onSave,
  onClose,
}: {
  settings: Settings;
  onSave: (s: Settings) => void;
  onClose: () => void;
}) {
  const [s, setS] = useState<Settings>(settings);
  const [test, setTest] = useState<TestState>({ status: "idle" });

  const setOllama = (patch: Partial<ProviderConfig>) =>
    setS({ ...s, ollama: { ...s.ollama, ...patch } });

  const runTest = async () => {
    setTest({ status: "loading" });
    try {
      const models = await listModels("ollama", s.ollama);
      setTest({ status: "ok", models });
    } catch (e) {
      const msg = (e as { message?: string })?.message ?? String(e);
      setTest({ status: "err", error: msg });
    }
  };

  return (
    <div className="modal" onClick={onClose}>
      <div className="modal__panel" onClick={(e) => e.stopPropagation()}>
        <div className="modal__head">
          <h3 className="modal__title">接続設定</h3>
          <button className="modal__close" onClick={onClose} aria-label="閉じる">
            ×
          </button>
        </div>

        <div className="form form--bare">
          <div className="field">
            <span className="field__label">使用する接続先</span>
            <div className="seg seg--wide">
              {PROVIDER_KINDS.map((k) => (
                <button
                  key={k}
                  className={"seg__btn" + (s.active === k ? " seg__btn--on" : "")}
                  onClick={() => setS({ ...s, active: k })}
                >
                  {PROVIDER_LABEL[k]}
                </button>
              ))}
            </div>
          </div>

          <fieldset className="fieldset">
            <legend>Ollama</legend>
            <label className="field">
              <span className="field__label">ベースURL</span>
              <input
                className="field__input"
                value={s.ollama.baseUrl}
                onChange={(e) => setOllama({ baseUrl: e.target.value })}
                placeholder="http://localhost:11434/v1"
              />
            </label>
            <label className="field">
              <span className="field__label">モデル</span>
              <input
                className="field__input"
                value={s.ollama.model}
                onChange={(e) => setOllama({ model: e.target.value })}
                placeholder="llama3.2"
              />
            </label>

            <div className="conntest">
              <button
                type="button"
                className="btn btn--mini"
                onClick={runTest}
                disabled={test.status === "loading"}
              >
                {test.status === "loading" ? "接続中…" : "接続テスト"}
              </button>
              {test.status === "ok" && (
                <div className="conntest__ok">
                  ✓ 接続OK・{test.models.length} モデル
                  <div className="conntest__models">
                    {test.models.slice(0, 12).map((m) => (
                      <button
                        key={m}
                        type="button"
                        className="modeltag"
                        title="このモデルを使う"
                        onClick={() => setOllama({ model: m })}
                      >
                        {m}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              {test.status === "err" && (
                <span className="conntest__err">✗ {test.error}</span>
              )}
            </div>
          </fieldset>

          <p className="field__note">
            Ollama は <code>ollama serve</code> で起動（既定 <code>http://localhost:11434</code>）。
            ブラウザで接続テストが失敗する場合は <code>OLLAMA_ORIGINS=*</code> を設定するか、
            デスクトップ版（Tauri）で起動してください（Tauri は CORS の制約を受けません）。
          </p>

          <div className="form__actions">
            <button className="btn btn--ghost" onClick={onClose}>
              キャンセル
            </button>
            <button
              className="btn btn--primary"
              onClick={() => {
                onSave(s);
                onClose();
              }}
            >
              保存
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
