import { useEffect, useState } from "react";
import type { Persona } from "../types";
import {
  PROVIDER_LABEL,
  PROVIDER_KINDS,
  type ProviderKind,
  type Settings,
} from "../core/settings";
import { listModels } from "../core/providers";

const KINDS = PROVIDER_KINDS;

export function ModelAssignModal({
  personas,
  settings,
  onSave,
  onClose,
}: {
  personas: Persona[]; // 司会 + 列席者
  settings: Settings;
  onSave: (s: Settings) => void;
  onClose: () => void;
}) {
  const [models, setModels] = useState<string[]>([]);

  // インストール済みモデルを取得(候補として提示)
  useEffect(() => {
    listModels("ollama", settings.ollama)
      .then(setModels)
      .catch(() => setModels([]));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const setOverride = (
    personaId: string,
    patch: { kind?: ProviderKind | ""; model?: string }
  ) => {
    const next = { ...settings, overrides: { ...settings.overrides } };
    const cur = next.overrides[personaId];
    if (patch.kind === "") {
      delete next.overrides[personaId];
    } else {
      const kind = (patch.kind ?? cur?.kind ?? settings.active) as ProviderKind;
      const model = patch.model ?? cur?.model ?? "";
      next.overrides[personaId] = { kind, model };
    }
    onSave(next);
  };

  return (
    <div className="modal" onClick={onClose}>
      <div className="modal__panel" onClick={(e) => e.stopPropagation()}>
        <div className="modal__head">
          <h3 className="modal__title">モデル割当</h3>
          <button className="modal__close" onClick={onClose} aria-label="閉じる">
            ×
          </button>
        </div>
        <p className="field__note" style={{ marginTop: 0 }}>
          人物ごとに接続先・モデルを上書きできます。「既定」のままなら全体設定に従います。
        </p>

        <datalist id="assign-model-list">
          {models.map((m) => (
            <option key={m} value={m} />
          ))}
        </datalist>

        <div className="assign">
          {personas.map((p) => {
            const ov = settings.overrides[p.id];
            return (
              <div className="assign__row" key={p.id}>
                <span className="assign__who">
                  <span
                    className="pcard__avatar"
                    style={{ background: p.color, width: 28, height: 28, fontSize: 13 }}
                  >
                    {p.initial}
                  </span>
                  <span className="assign__name">{p.name}</span>
                </span>

                <select
                  className="assign__select"
                  value={ov?.kind ?? ""}
                  onChange={(e) =>
                    setOverride(p.id, { kind: e.target.value as ProviderKind | "" })
                  }
                >
                  <option value="">既定</option>
                  {KINDS.map((k) => (
                    <option key={k} value={k}>
                      {PROVIDER_LABEL[k]}
                    </option>
                  ))}
                </select>

                <input
                  className="assign__model"
                  list="assign-model-list"
                  placeholder="モデル名(空=既定)"
                  value={ov?.model ?? ""}
                  disabled={!ov}
                  onChange={(e) => setOverride(p.id, { model: e.target.value })}
                />
              </div>
            );
          })}
        </div>

        <div className="form__actions">
          <button className="btn btn--primary" onClick={onClose}>
            閉じる
          </button>
        </div>
      </div>
    </div>
  );
}
