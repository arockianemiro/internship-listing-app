CREATE TABLE IF NOT EXISTS internships (
                                           id SERIAL PRIMARY KEY,
                                           title VARCHAR(255) NOT NULL,
    company VARCHAR(255) NOT NULL,
    location VARCHAR(100) DEFAULT 'Remote',
    domain VARCHAR(100) DEFAULT 'General',
    created_by INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );