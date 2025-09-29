use std::sync::Arc;
use tokio::sync::Mutex;

use crate::audio::engine::AudioEngine;

pub struct AppState {
    pub audio_engine: Arc<Mutex<AudioEngine>>,
}

impl AppState {
    pub fn new() -> Self {
        Self {
            audio_engine: Arc::new(Mutex::new(AudioEngine::new())),
        }
    }
}

impl Default for AppState {
    fn default() -> Self {
        Self::new()
    }
}
