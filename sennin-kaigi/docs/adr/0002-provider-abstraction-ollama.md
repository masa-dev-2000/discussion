# 0002. プロバイダ抽象化と Ollama への集約

- Status: Accepted
- Date: 2026-06

## Context

ローカル LLM・クラウド API・LLM 無しのデモを切り替えたい。当初は OpenAI 互換 API 全般(LM Studio / OpenAI 等)を
想定していたが、用途(ローカルでのアイデアエーション)に合わせて接続先を絞ることにした。

## Decision

- LLM 接続は **OpenAI 互換の `/chat/completions`(SSE ストリーミング)と `/models`** を共通インターフェースにする。
- 接続先(`ProviderKind`)を **`mock`(デモ)** と **`ollama`** の2種に集約。汎用 API 選択肢は撤去。
- 既定は Ollama(`http://localhost:11434/v1`)。`/models` でインストール済みモデルを取得して選択できる。
- 設定は localStorage に保存。旧バージョン(local/api)からは読み込み時に移行。

## Consequences

- 設定 UI と概念が単純化。Ollama に最適化したガイド(接続テスト・モデル選択・CORS 注記)を提供できる。
- OpenAI 互換であれば実装上は他バックエンドも流用可能だが、UI 上は Ollama に固定。
- 「デモ」を常設したことで LLM 無しでも全機能の動作確認ができる(開発・スクショ検証に有効)。
