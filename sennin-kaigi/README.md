# 先人会議 (Council of the Ancients)

歴史上・現代の思想家(先人)を対話者として、テーマについて議論させるデスクトップアプリ。
ローカル LLM の **Ollama** と、LLM 不要の **デモ** に対応。

## ドキュメント

- [作業ログ](docs/worklog.md) — 構築の進行記録
- [ADR](docs/adr/README.md) — 設計判断の記録

## 画面

- **議論一覧** … 議論をカード表示。各カードの「要約」から流れのまとめを閲覧
- **議論設定** … テーマ・ゴール・ラウンド数・対話者を設定して新規作成
- **論壇** … 発言をライブ表示(ストリーミング)。終了後に自動で要約を生成

## 構成

```
src/
├─ core/                オーケストレーター & LLM 接続
│  ├─ providers.ts      OpenAI 互換 SSE ストリーミング / デモ(mock)
│  ├─ orchestrator.ts   開会→各ラウンド→閉会の会議ループ + 要約生成
│  └─ settings.ts       接続設定(localStorage 永続化)
├─ pages/               DiscussionList / DiscussionSetup / Arena
├─ components/          Transcript / SummaryModal / SettingsModal ほか
└─ data/                personas(対話者カタログ) / discussions(初期データ)
src-tauri/              Tauri(デスクトップ化)
```

## 開発(Web only — 見た目・ロジックの確認)

```bash
npm install
npm run dev        # http://localhost:1420
```

接続先トグルを「デモ」にすれば LLM なしで一通り動きます。

## デスクトップアプリ(Tauri)

事前に Rust と各 OS の前提パッケージが必要です:
https://v2.tauri.app/start/prerequisites/
(Linux は `webkit2gtk-4.1` / `librsvg2` 等、macOS は Xcode CLT、Windows は WebView2 + MSVC)

```bash
npm run tauri dev      # 開発(ホットリロード付きデスクトップ窓)
npm run tauri build    # 配布用バイナリ(.app / .exe / .deb 等)
```

Tauri 上では API 呼び出しが Rust 側 HTTP を経由するため、ブラウザの CORS 制約を受けません。

### デスクトップからクリックで起動(Windows)

```powershell
npm run tauri build           # ビルド(初回は数分)
npm run shortcut:win          # デスクトップにショートカットを作成
```

- ビルド後の実行ファイル: `src-tauri\target\release\先人会議.exe`(これを直接ダブルクリックでも起動)
- インストーラ: `src-tauri\target\release\bundle\nsis\*-setup.exe` / `bundle\msi\*.msi`
  （インストールするとスタートメニューに登録され、アイコンも付きます）
- `npm run shortcut:win` はデスクトップとスタートメニューに「先人会議」ショートカットを作成します
  - デスクトップ: ダブルクリックで起動
  - スタートメニュー: **Win キー → 「先人会議」または「sennin」で検索 → 起動**（出るまで数十秒かかることあり）
- もしくはインストーラ `bundle\nsis\*-setup.exe` でインストールすると、スタートメニュー登録・検索・アンインストールに対応します

> 実利用には別途 `ollama serve` を起動しておいてください（デモ接続なら不要）。

## LLM の接続(Ollama)

論壇右上の ⚙(接続設定)で **デモ / Ollama** を切り替え。⚙ には **「接続テスト」** があり、
モデル一覧を取得して疎通を確認できます（取得したモデル名をクリックすると設定欄に入ります）。

| 接続先 | 設定 |
|---|---|
| デモ | 設定不要。LLM なしで動作確認 |
| Ollama | `ollama serve` を起動し、ベースURL `http://localhost:11434/v1` とモデルを指定 |

### Ollama に繋いで試す

```bash
ollama serve            # 既定で http://localhost:11434
ollama pull llama3.2    # 使うモデルを取得(例: llama3.2 / qwen2.5 など)
```

1. アプリを起動（`npm run dev` または `npm run tauri dev`）
2. 論壇の ⚙ → ベースURLが `http://localhost:11434/v1` であることを確認 →
   **接続テスト** → モデル名が出れば OK。出たモデル名をクリックして「モデル」に設定
3. 接続先トグルを **「Ollama」** にして **議論を開始**

> **ブラウザ（`npm run dev`）で接続テストが失敗する場合**は CORS が原因です。
> Ollama を `OLLAMA_ORIGINS=* ollama serve` で起動するか、**`npm run tauri dev`(デスクトップ版)** で
> 起動してください。Tauri 版は HTTP を Rust 側で行うため CORS の制約を受けません。
