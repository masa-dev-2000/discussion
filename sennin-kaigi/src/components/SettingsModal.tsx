import { useState } from "react";
import {
  PROVIDER_LABEL,
  type ProviderConfig,
  type ProviderKind,
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
  const [test, setTest] = useState<Record<"local" | "api", TestState>>({
    local: { status: "idle" },
    api: { status: "idle" },
  });

  const setLocal = (patch: Partial<ProviderConfig>) =>
    setS({ ...s, local: { ...s.local, ...patch } });
  const setApi = (patch: Partial<ProviderConfig>) =>
    setS({ ...s, api: { ...s.api, ...patch } });

  const runTest = async (which: "local" | "api") => {
    setTest((t) => ({ ...t, [which]: { status: "loading" } }));
    try {
      const cfg = which === "api" ? s.api : s.local;
      const models = await listModels(which, cfg);
      setTest((t) => ({ ...t, [which]: { status: "ok", models } }));
    } catch (e) {
      const msg = (e as { message?: string })?.message ?? String(e);
      setTest((t) => ({ ...t, [which]: { status: "err", error: msg } }));
    }
  };

  const renderTest = (
    which: "local" | "api",
    apply: (model: string) => void
  ) => {
    const st = test[which];
    return (
      <div className="conntest">
        <button
          type="button"
          className="btn btn--mini"
          onClick={() => runTest(which)}
          disabled={st.status === "loading"}
        >
          {st.status === "loading" ? "接続中…" : "接続テスト"}
        </button>
        {st.status === "ok" && (
          <div className="conntest__ok">
            ✓ 接続OK・{st.models.length} モデル
            <div className="conntest__models">
              {st.models.slice(0, 8).map((m) => (
                <button
                  key={m}
                  type="button"
                  className="modeltag"
                  title="このモデルを使う"
                  onClick={() => apply(m)}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>
        )}
        {st.status === "err" && (
          <span className="conntest__err">✗ {st.error}</span>
        )}
      </div>
    );
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
                placeholder="http://localhost:1234/v1"
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
            {renderTest("local", (m) => setLocal({ model: m }))}
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
            {renderTest("api", (m) => setApi({ model: m }))}
          </fieldset>

          <p className="field__note">
            ブラウザで「接続OK」にならない場合は、LM Studio の Server 設定で CORS
            を有効にするか、デスクトップ版（Tauri）で起動してください（Tauri は CORS
            の制約を受けません）。
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
