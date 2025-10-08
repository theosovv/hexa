CREATE TABLE reverb_impulses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  track_id UUID REFERENCES tracks(id) ON DELETE CASCADE,
  filename VARCHAR(255) NOT NULL,
  file_size BIGINT NOT NULL,
  s3_key TEXT NOT NULL,
  mime_type VARCHAR(100),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_reverb_impulses_user_id ON reverb_impulses(user_id);
CREATE INDEX idx_reverb_impulses_track_id ON reverb_impulses(track_id);