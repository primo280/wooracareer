-- Create notifications table
CREATE TABLE IF NOT EXISTS notifications (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL CHECK (type IN ('application_status', 'new_job', 'interview', 'message')),
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    read BOOLEAN DEFAULT FALSE,
    job_id INTEGER REFERENCES jobs(id) ON DELETE CASCADE,
    application_id INTEGER REFERENCES applications(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at);

-- Insert sample notifications
INSERT INTO notifications (user_id, type, title, message, job_id, created_at) VALUES
('sample-user-1', 'application_status', 'Candidature mise à jour', 'Votre candidature pour le poste de Développeur Full Stack chez TechCorp a été acceptée pour un entretien !', 1, NOW() - INTERVAL '1 day'),
('sample-user-1', 'new_job', 'Nouvelle offre recommandée', 'Une nouvelle offre correspondant à votre profil : Développeur React Senior chez StartupTech', 2, NOW() - INTERVAL '2 days'),
('sample-user-1', 'interview', 'Entretien programmé', 'Votre entretien avec DataCorp est prévu pour demain à 14h00. Préparez-vous bien !', 3, NOW() - INTERVAL '3 days');
