// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/

use crate::commands::{init_audio, is_playing, play_audio, stop_audio};
use crate::state::AppState;

pub mod audio;
pub mod commands;
pub mod state;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    let app_state = AppState::new();

    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .manage(app_state)
        .invoke_handler(tauri::generate_handler![
            init_audio, play_audio, stop_audio, is_playing
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
