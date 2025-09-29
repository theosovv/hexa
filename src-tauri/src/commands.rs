use crate::state::AppState;

#[tauri::command]
pub async fn init_audio(state: tauri::State<'_, AppState>) -> Result<String, String> {
    let mut engine = state.audio_engine.lock().await;

    engine.initialize().map_err(|e| e.to_string())?;

    Ok("Audio engine initialized".to_string())
}

#[tauri::command]
pub async fn play_audio(state: tauri::State<'_, AppState>) -> Result<(), String> {
    let mut engine = state.audio_engine.lock().await;

    engine.play();

    Ok(())
}

#[tauri::command]
pub async fn stop_audio(state: tauri::State<'_, AppState>) -> Result<(), String> {
    let mut engine = state.audio_engine.lock().await;

    engine.stop();

    Ok(())
}

#[tauri::command]
pub async fn is_playing(state: tauri::State<'_, AppState>) -> Result<bool, String> {
    let engine = state.audio_engine.lock().await;

    Ok(engine.is_playing())
}
