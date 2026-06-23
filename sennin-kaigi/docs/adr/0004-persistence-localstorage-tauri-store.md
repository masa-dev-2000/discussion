# 0004. 永続化: localStorage / Tauri Store の二段構え

- Status: Accepted
- Date: 2026-06

## Context

議論が再起動で消えるのを防ぎたい。Web(開発)とデスクトップ(Tauri)の両方で動かす。

## Decision

永続化レイヤ(`core/storage.ts`)を非同期化し、実行環境で保存先を切り替える。

- **Tauri**: `@tauri-apps/plugin-store` でアプリのデータディレクトリに `discussions.json` を保存。
- **ブラウザ**: `localStorage` にフォールバック。
- 初回はシードデータを表示。読み込み時に整合(進行中のまま閉じた議論は done/draft に正規化、`mode` 欠落は `debate` 補完)。

## Consequences

- デスクトップでは「アプリらしい」ファイル保存、ブラウザでも同じコードで動作。
- アプリ起動時に非同期ロード、ロード完了後のみ保存(初期化前の空配列で上書きしない)。
- 将来、複数端末同期やエクスポート(Markdown/JSON)に拡張する余地を残す。
