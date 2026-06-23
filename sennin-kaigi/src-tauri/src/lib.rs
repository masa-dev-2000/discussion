#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        // OpenAI 互換 API への HTTP を Rust 側で行う(ブラウザの CORS 制約を受けない)
        .plugin(tauri_plugin_http::init())
        // 議論データのファイル永続化
        .plugin(tauri_plugin_store::Builder::new().build())
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
