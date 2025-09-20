-- Create applications table for job applications
CREATE TABLE IF NOT EXISTS applications (
  id SERIAL PRIMARY KEY,
  job_id INTEGER REFERENCES jobs(id) ON DELETE CASCADE,
  candidate_id INTEGER REFERENCES candidates(id) ON DELETE CASCADE,
  status VARCHAR(50) DEFAULT 'pending', -- pending, reviewing, interview, rejected, accepted
  cover_letter TEXT,
  applied_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  notes TEXT, -- Admin notes
  interview_date TIMESTAMP WITH TIME ZONE,
  
  -- Ensure one application per job per candidate
  UNIQUE(job_id, candidate_id)
);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_applications_job_id ON applications(job_id);
CREATE INDEX IF NOT EXISTS idx_applications_candidate_id ON applications(candidate_id);
CREATE INDEX IF NOT EXISTS idx_applications_status ON applications(status);
CREATE INDEX IF NOT EXISTS idx_applications_applied_at ON applications(applied_at);

-- Additional updates can be added here if necessary
