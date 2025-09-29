// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/

use std::sync::Arc;

use tokio::sync::Mutex;

use crate::audio_engine::AudioEngine;

pub mod audio_engine;

struct AppState {
    audio_engine: Arc<Mutex<AudioEngine>>,
}

#[tauri::command]
async fn init_audio(state: tauri::State<'_, AppState>) -> Result<String, String> {
    let mut engine = state.audio_engine.lock().await;

    engine.initialize().map_err(|e| e.to_string())?;

    Ok("Audio engine initialized".to_string())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    let audio_engine = Arc::new(Mutex::new(AudioEngine::new()));

    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .manage(AppState { audio_engine })
        .invoke_handler(tauri::generate_handler![init_audio])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
