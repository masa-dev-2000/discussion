import { useEffect, useState } from "react";
import {
  PROVIDER_LABEL,
  PROVIDER_KINDS,
  type ProviderConfig,
  type Settings,
} from "../core/settings";
import { listModels } from "../core/providers";

type FetchState = "idle" | "loading" | "ok" | "err";

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
  const [models, setModels] = useState<string[]>([]);
  const [fstate, setFstate] = useState<FetchState>("idle");
  const [ferr, setFerr] = useState("");

  const setOllama = (patch: Partial<ProviderConfig>) =>
    setS((prev) => ({ ...prev, ollama: { ...prev.ollama, ...patch } }));

  // 開いた時点で、現在のベースURLからインストール済みモデルを取得
  const fetchModels = async () => {
    setFstate("loading");
    setFerr("");
    try {
      const ms = await listModels("ollama", s.ollama);
      setModels(ms);
      setFstate("ok");
      // モデル未設定なら先頭を採用
      if (!s.ollama.model && ms.length) setOllama({ model: ms[0] });
    } catch (e) {
      setFerr((e as { message?: string })?.message ?? String(e));
      setFstate("err");
    }
  };

  useEffect(() => {
    fetchModels();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

            <div className="field">
              <span className="field__label">
                モデル{" "}
                <span className="field__hint">（インストール済みから選択 / 手入力可）</span>
              </span>
              <select
                className="field__input"
                value={models.includes(s.ollama.model) ? s.ollama.model : "__custom__"}
                onChange={(e) => {
                  if (e.target.value !== "__custom__") setOllama({ model: e.target.value });
                }}
                disabled={fstate !== "ok" || models.length === 0}
              >
                {!models.includes(s.ollama.model) && (
                  <option value="__custom__">
                    {s.ollama.model ? `${s.ollama.model}（手入力）` : "（未選択）"}
                  </option>
                )}
                {models.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
              <input
                className="field__input"
                value={s.ollama.model}
                onChange={(e) => setOllama({ model: e.target.value })}
                placeholder="llama3.2"
              />
            </div>

            <div className="conntest">
              <button
                type="button"
                className="btn btn--mini"
                onClick={fetchModels}
                disabled={fstate === "loading"}
              >
                {fstate === "loading" ? "取得中…" : "モデル再取得"}
              </button>
              {fstate === "ok" && (
                <span className="conntest__ok">✓ {models.length} モデル</span>
              )}
              {fstate === "err" && <span className="conntest__err">✗ {ferr}</span>}
            </div>
          </fieldset>

          <p className="field__note">
            Ollama は <code>ollama serve</code> で起動（既定 <code>http://localhost:11434</code>）。
            一覧が出ない場合は <code>OLLAMA_ORIGINS=*</code> を設定するか、デスクトップ版（Tauri）で
            起動してください（Tauri は CORS の制約を受けません）。
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
