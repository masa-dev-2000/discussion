import { useState } from "react";
import {
  PROVIDER_LABEL,
  type ProviderConfig,
  type ProviderKind,
  type Settings,
} from "../core/settings";

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
  const setLocal = (patch: Partial<ProviderConfig>) =>
    setS({ ...s, local: { ...s.local, ...patch } });
  const setApi = (patch: Partial<ProviderConfig>) =>
    setS({ ...s, api: { ...s.api, ...patch } });

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
              {(["mock", "local", "api"] as ProviderKind[]).map((k) => (
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
            <legend>ローカル (LM Studio / Ollama)</legend>
            <label className="field">
              <span className="field__label">ベースURL</span>
              <input
                className="field__input"
                value={s.local.baseUrl}
                onChange={(e) => setLocal({ baseUrl: e.target.value })}
              />
            </label>
            <label className="field">
              <span className="field__label">モデル</span>
              <input
                className="field__input"
                value={s.local.model}
                onChange={(e) => setLocal({ model: e.target.value })}
              />
            </label>
          </fieldset>

          <fieldset className="fieldset">
            <legend>API (OpenAI 互換)</legend>
            <label className="field">
              <span className="field__label">ベースURL</span>
              <input
                className="field__input"
                value={s.api.baseUrl}
                onChange={(e) => setApi({ baseUrl: e.target.value })}
              />
            </label>
            <label className="field">
              <span className="field__label">モデル</span>
              <input
                className="field__input"
                value={s.api.model}
                onChange={(e) => setApi({ model: e.target.value })}
              />
            </label>
            <label className="field">
              <span className="field__label">APIキー</span>
              <input
                className="field__input"
                type="password"
                value={s.api.apiKey}
                onChange={(e) => setApi({ apiKey: e.target.value })}
                placeholder="sk-..."
              />
            </label>
          </fieldset>

          <p className="field__note">
            「デモ」は LLM 不要でその場で動作確認できます。ブラウザからの API 直接呼び出しは
            CORS で失敗する場合があります（Tauri 化で解消）。
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
