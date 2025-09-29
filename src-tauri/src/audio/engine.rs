use cpal::traits::{DeviceTrait, HostTrait};
use cpal::{Device, Host, Stream, SupportedStreamConfig};

pub struct AudioEngine {
    host: Host,
    input_device: Option<Device>,
    output_device: Option<Device>,
    stream: Option<Stream>,
    config: Option<SupportedStreamConfig>,
    is_playing: bool,
}

impl AudioEngine {
    pub fn new() -> Self {
        let host = cpal::default_host();
        Self {
            host,
            input_device: None,
            output_device: None,
            stream: None,
            config: None,
            is_playing: false,
        }
    }

    pub fn initialize(&mut self) -> Result<(), Box<dyn std::error::Error>> {
        let input_device = self.host.default_input_device();
        let output_device = self
            .host
            .default_output_device()
            .ok_or("No output device available")?;

        let config = output_device.default_output_config()?;

        self.input_device = input_device;
        self.output_device = Some(output_device);
        self.config = Some(config);

        Ok(())
    }

    pub fn is_playing(&self) -> bool {
        self.is_playing
    }

    pub fn play(&mut self) {
        self.is_playing = true;
    }

    pub fn stop(&mut self) {
        self.is_playing = false;
    }
}
