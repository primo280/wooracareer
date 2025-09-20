-- Create candidates table to extend user information
CREATE TABLE IF NOT EXISTS candidates (
  id SERIAL PRIMARY KEY,
  user_id TEXT REFERENCES neon_auth.users_sync(id) ON DELETE CASCADE,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  phone VARCHAR(20),
  location VARCHAR(200),
  bio TEXT,
  resume_url TEXT,
  linkedin_url TEXT,
  portfolio_url TEXT,
  skills TEXT[], -- Array of skills
  experience_level VARCHAR(50) DEFAULT 'junior', -- junior, mid, senior, expert
  availability VARCHAR(50) DEFAULT 'available', -- available, not_available, open_to_offers
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_candidates_user_id ON candidates(user_id);
CREATE INDEX IF NOT EXISTS idx_candidates_experience ON candidates(experience_level);
CREATE INDEX IF NOT EXISTS idx_candidates_availability ON candidates(availability);

-- Additional updates can be made here if necessary
