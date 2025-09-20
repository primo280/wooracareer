-- Creating the main jobs table for storing job listings
CREATE TABLE IF NOT EXISTS jobs (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  company VARCHAR(255) NOT NULL,
  location VARCHAR(255) NOT NULL,
  type VARCHAR(50) NOT NULL, -- 'CDI', 'CDD', 'Stage', 'Freelance'
  salary_min INTEGER,
  salary_max INTEGER,
  currency VARCHAR(3) DEFAULT 'EUR',
  description TEXT NOT NULL,
  requirements TEXT,
  benefits TEXT,
  remote_work BOOLEAN DEFAULT FALSE,
  experience_level VARCHAR(50), -- 'Junior', 'Confirmé', 'Senior'
  contract_duration VARCHAR(100), -- For CDD contracts
  application_url VARCHAR(500),
  application_email VARCHAR(255),
  company_logo VARCHAR(500),
  company_website VARCHAR(500),
  tags TEXT[], -- Array of skill tags
  featured BOOLEAN DEFAULT FALSE,
  status VARCHAR(20) DEFAULT 'active', -- 'active', 'paused', 'closed'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE,
  created_by TEXT REFERENCES users_sync(id),
  views_count INTEGER DEFAULT 0
);

-- Creating indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_jobs_status ON jobs(status);
CREATE INDEX IF NOT EXISTS idx_jobs_type ON jobs(type);
CREATE INDEX IF NOT EXISTS idx_jobs_location ON jobs(location);
CREATE INDEX IF NOT EXISTS idx_jobs_created_at ON jobs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_jobs_featured ON jobs(featured);
CREATE INDEX IF NOT EXISTS idx_jobs_tags ON jobs USING GIN(tags);

-- Additional updates can be added here if necessary
