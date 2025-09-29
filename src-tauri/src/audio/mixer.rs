pub struct Channel {
    pub id: u32,
    pub volume: f32,
    pub pan: f32,
    pub muted: bool,
    pub solo: bool,
}

pub struct Mixer {
    channels: Vec<Channel>,
    master_volume: f32,
}

impl Mixer {
    pub fn new() -> Self {
        Self {
            channels: Vec::new(),
            master_volume: 1.0,
        }
    }

    pub fn add_channel(&mut self) -> u32 {
        let id = self.channels.len() as u32;
        self.channels.push(Channel {
            id,
            volume: 1.0,
            pan: 0.0,
            muted: false,
            solo: false,
        });
        id
    }
}

impl Default for Mixer {
    fn default() -> Self {
        Self::new()
    }
}
