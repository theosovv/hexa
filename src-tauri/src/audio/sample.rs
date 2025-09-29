use std::path::PathBuf;

#[derive(Debug, Clone)]
pub struct Sample {
    pub id: String,
    pub name: String,
    pub path: PathBuf,
    pub duration: f32,
}
