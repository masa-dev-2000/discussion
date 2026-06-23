# 0001. フロントエンドでオーケストレーション(Tauri 単体、別サーバなし)

- Status: Accepted
- Date: 2026-06

## Context

複数ペルソナを順番に LLM へ問い合わせ、出力を次の入力に渡して議論を進める必要がある。
当初は「独自 UI ←(WebSocket)→ バックエンドのオーケストレーター ← LLM」という3層を想定したが、
配布形態をデスクトップアプリ(Tauri)に決めた。

## Decision

オーケストレーションのループを**フロントエンド(webview 内の TypeScript)に同居**させ、別プロセスのサーバを持たない。
LLM への HTTP は、Tauri 上では `tauri-plugin-http`(Rust 側 HTTP)経由にしてブラウザの CORS 制約を回避し、
ブラウザ実行時は通常の `fetch` にフォールバックする(`__TAURI_INTERNALS__` で判定)。

## Consequences

- 別サーバ・WebSocket が不要で構成が単純。発言は async ジェネレータで React state に流す。
- デスクトップでは CORS の問題が消える。ブラウザ開発では LLM 側の CORS 設定(`OLLAMA_ORIGINS`)が必要。
- 重い処理(LLM 呼び出し)も UI スレッド側で回るため、トークン更新は `requestAnimationFrame` で間引いて負荷を抑える。
- ルーティングは依存を増やさないため、ハッシュベースの最小ルーターを自作。
