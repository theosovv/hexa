use cpal::{
    traits::{DeviceTrait, HostTrait},
    Device, Host, Stream, SupportedStreamConfig,
};

pub struct AudioEngine {
    host: Host,
    input_device: Option<Device>,
    output_device: Option<Device>,
    stream: Option<Stream>,
    config: Option<SupportedStreamConfig>,
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
        }
    }

    pub fn initialize(&mut self) -> Result<(), Box<dyn std::error::Error>> {
        let input_device = self.host.default_input_device();
        let output_device = self
            .host
            .default_output_device()
            .ok_or("No output device")?;

        let config = output_device.default_output_config()?;

        self.input_device = input_device;
        self.output_device = Some(output_device);
        self.config = Some(config);

        Ok(())
    }
}

impl Default for AudioEngine {
    fn default() -> Self {
        Self::new()
    }
}
