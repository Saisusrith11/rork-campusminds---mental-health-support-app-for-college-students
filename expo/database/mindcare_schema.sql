-- MindCare Database Schema
-- Created for comprehensive mental health platform

CREATE DATABASE IF NOT EXISTS mindcare_db;
USE mindcare_db;

-- Users table (students, counselors, volunteers, admins)
CREATE TABLE users (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(100) NOT NULL,
    role ENUM('student', 'counselor', 'volunteer', 'admin') NOT NULL,
    college VARCHAR(100),
    avatar VARCHAR(255),
    is_onboarded BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Student specific fields
    student_id VARCHAR(20),
    year VARCHAR(20),
    department VARCHAR(100),
    emergency_contact VARCHAR(20),
    
    -- Counselor specific fields
    license_number VARCHAR(50),
    specializations JSON,
    experience VARCHAR(10),
    qualifications TEXT,
    languages JSON,
    is_verified BOOLEAN DEFAULT FALSE,
    
    -- Volunteer specific fields
    volunteer_type VARCHAR(50),
    availability VARCHAR(100),
    training_completed BOOLEAN DEFAULT FALSE,
    
    -- Assessment data
    last_assessment_score INT,
    risk_level ENUM('minimal', 'moderate', 'high'),
    consent_to_share BOOLEAN DEFAULT FALSE
);

-- Mood entries table
CREATE TABLE mood_entries (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    user_id VARCHAR(36) NOT NULL,
    mood ENUM('very-sad', 'sad', 'neutral', 'happy', 'very-happy') NOT NULL,
    note TEXT,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Chat sessions table
CREATE TABLE chat_sessions (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    participants JSON NOT NULL, -- Array of user IDs
    type ENUM('ai', 'counselor', 'volunteer') NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    start_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    end_time TIMESTAMP NULL,
    is_encrypted BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Chat messages table
CREATE TABLE chat_messages (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    session_id VARCHAR(36) NOT NULL,
    sender_id VARCHAR(36) NOT NULL,
    content TEXT NOT NULL,
    sender_type ENUM('user', 'ai', 'counselor', 'volunteer') NOT NULL,
    message_type ENUM('text', 'image', 'file') DEFAULT 'text',
    is_encrypted BOOLEAN DEFAULT TRUE,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (session_id) REFERENCES chat_sessions(id) ON DELETE CASCADE,
    FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Resources table
CREATE TABLE resources (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    title VARCHAR(200) NOT NULL,
    description TEXT,
    type ENUM('article', 'video', 'exercise', 'audio', 'pdf') NOT NULL,
    duration VARCHAR(20),
    category VARCHAR(50),
    image_url VARCHAR(255),
    content LONGTEXT,
    file_url VARCHAR(255),
    assigned_by VARCHAR(36),
    language VARCHAR(10) DEFAULT 'en',
    is_personalized BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (assigned_by) REFERENCES users(id) ON DELETE SET NULL
);

-- Resource assignments table
CREATE TABLE resource_assignments (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    resource_id VARCHAR(36) NOT NULL,
    assigned_to VARCHAR(36) NOT NULL,
    assigned_by VARCHAR(36) NOT NULL,
    assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP NULL,
    FOREIGN KEY (resource_id) REFERENCES resources(id) ON DELETE CASCADE,
    FOREIGN KEY (assigned_to) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (assigned_by) REFERENCES users(id) ON DELETE CASCADE
);

-- Assessments table
CREATE TABLE assessments (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    user_id VARCHAR(36) NOT NULL,
    score INT NOT NULL,
    responses JSON NOT NULL,
    risk_level ENUM('minimal', 'moderate', 'high') NOT NULL,
    shared_with_counselor BOOLEAN DEFAULT FALSE,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Wellness activities table
CREATE TABLE wellness_activities (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    title VARCHAR(200) NOT NULL,
    description TEXT,
    type ENUM('meditation', 'breathing', 'exercise', 'journaling', 'mindfulness') NOT NULL,
    duration INT NOT NULL, -- in minutes
    instructions JSON NOT NULL,
    category VARCHAR(50),
    assigned_by VARCHAR(36),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (assigned_by) REFERENCES users(id) ON DELETE SET NULL
);

-- Activity assignments table
CREATE TABLE activity_assignments (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    activity_id VARCHAR(36) NOT NULL,
    assigned_to VARCHAR(36) NOT NULL,
    assigned_by VARCHAR(36) NOT NULL,
    assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP NULL,
    FOREIGN KEY (activity_id) REFERENCES wellness_activities(id) ON DELETE CASCADE,
    FOREIGN KEY (assigned_to) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (assigned_by) REFERENCES users(id) ON DELETE CASCADE
);

-- Appointments table
CREATE TABLE appointments (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    student_id VARCHAR(36) NOT NULL,
    counselor_id VARCHAR(36) NOT NULL,
    date DATE NOT NULL,
    time TIME NOT NULL,
    duration INT DEFAULT 60, -- in minutes
    status ENUM('pending', 'approved', 'declined', 'completed', 'cancelled') DEFAULT 'pending',
    type ENUM('individual', 'group', 'crisis') DEFAULT 'individual',
    notes TEXT,
    student_risk_level ENUM('minimal', 'moderate', 'high'),
    student_assessment_score INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (counselor_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Session notes table
CREATE TABLE session_notes (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    appointment_id VARCHAR(36) NOT NULL,
    counselor_id VARCHAR(36) NOT NULL,
    student_id VARCHAR(36) NOT NULL,
    content TEXT NOT NULL,
    goals JSON,
    progress TEXT,
    next_steps TEXT,
    risk_assessment ENUM('low', 'medium', 'high') NOT NULL,
    follow_up_required BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (appointment_id) REFERENCES appointments(id) ON DELETE CASCADE,
    FOREIGN KEY (counselor_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Community posts table
CREATE TABLE community_posts (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    content TEXT NOT NULL,
    author_id VARCHAR(36) NOT NULL,
    is_anonymous BOOLEAN DEFAULT FALSE,
    category VARCHAR(50),
    is_flagged BOOLEAN DEFAULT FALSE,
    is_approved BOOLEAN DEFAULT TRUE,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Community responses table
CREATE TABLE community_responses (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    post_id VARCHAR(36) NOT NULL,
    content TEXT NOT NULL,
    author_id VARCHAR(36) NOT NULL,
    author_role ENUM('volunteer', 'counselor', 'student') NOT NULL,
    is_approved BOOLEAN DEFAULT FALSE,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (post_id) REFERENCES community_posts(id) ON DELETE CASCADE,
    FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Emergency contacts table
CREATE TABLE emergency_contacts (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    name VARCHAR(100) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    description TEXT,
    type ENUM('crisis', 'support') NOT NULL,
    is_national BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    created_by VARCHAR(36),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
);

-- Notifications table
CREATE TABLE notifications (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    user_id VARCHAR(36) NOT NULL,
    title VARCHAR(200) NOT NULL,
    body TEXT NOT NULL,
    type ENUM('appointment', 'message', 'assessment', 'emergency', 'system') NOT NULL,
    priority ENUM('low', 'normal', 'high', 'urgent') DEFAULT 'normal',
    data JSON,
    is_read BOOLEAN DEFAULT FALSE,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- File uploads table
CREATE TABLE file_uploads (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    original_name VARCHAR(255) NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    file_type VARCHAR(50) NOT NULL,
    file_size INT NOT NULL,
    uploaded_by VARCHAR(36) NOT NULL,
    upload_type ENUM('resource', 'avatar', 'document') NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (uploaded_by) REFERENCES users(id) ON DELETE CASCADE
);

-- User sessions table (for authentication)
CREATE TABLE user_sessions (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    user_id VARCHAR(36) NOT NULL,
    token VARCHAR(255) NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Indexes for better performance
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_mood_entries_user_timestamp ON mood_entries(user_id, timestamp);
CREATE INDEX idx_chat_messages_session ON chat_messages(session_id, timestamp);
CREATE INDEX idx_appointments_student ON appointments(student_id, date);
CREATE INDEX idx_appointments_counselor ON appointments(counselor_id, date);
CREATE INDEX idx_notifications_user ON notifications(user_id, timestamp);
CREATE INDEX idx_community_posts_timestamp ON community_posts(timestamp);

-- Insert default emergency contacts
INSERT INTO emergency_contacts (name, phone, description, type, is_national) VALUES
('NIMHANS Helpline', '1800-599-0019', '24x7 Mental Health Support', 'crisis', TRUE),
('iCall (TISS)', '+91 9152987821', '24x7 Psychosocial Helpline', 'crisis', TRUE),
('Vandrevala Foundation', '9999666555', '24x7 Mental Health Support', 'crisis', TRUE),
('Sneha India', '044-24640050', 'Emotional Support Helpline', 'support', TRUE),
('AASRA', '022-27546669', 'Suicide Prevention Helpline', 'crisis', TRUE);

-- Insert demo users
INSERT INTO users (id, username, email, password_hash, name, role, college, is_onboarded, student_id, year, department, emergency_contact) VALUES
('student-001', 'student1', 'arjun@example.com', '$2b$10$example_hash', 'Arjun Kumar', 'student', 'Delhi University', TRUE, 'STU001', '3rd Year', 'Computer Science', '+91-9876543210'),
('student-002', 'student2', 'priya@example.com', '$2b$10$example_hash', 'Priya Sharma', 'student', 'Mumbai University', TRUE, 'STU002', '2nd Year', 'Psychology', '+91-9876543211'),
('student-003', 'student3', 'rahul@example.com', '$2b$10$example_hash', 'Rahul Singh', 'student', 'Bangalore University', TRUE, 'STU003', '4th Year', 'Engineering', '+91-9876543212');

INSERT INTO users (id, username, email, password_hash, name, role, college, is_onboarded, license_number, specializations, experience, qualifications, is_verified) VALUES
('counselor-001', 'counselor1', 'meera@example.com', '$2b$10$example_hash', 'Dr. Meera Patel', 'counselor', 'CampusMinds University', TRUE, 'PSY-2024-001', '["Clinical Psychology"]', '8', 'Licensed Clinical Psychologist', TRUE),
('counselor-002', 'counselor2', 'rajesh@example.com', '$2b$10$example_hash', 'Dr. Rajesh Gupta', 'counselor', 'CampusMinds University', TRUE, 'PSY-2024-002', '["Anxiety & Depression"]', '12', 'Licensed Mental Health Professional', TRUE),
('counselor-003', 'counselor3', 'anita@example.com', '$2b$10$example_hash', 'Dr. Anita Reddy', 'counselor', 'CampusMinds University', TRUE, 'PSY-2024-003', '["Student Counseling"]', '6', 'Licensed Student Counselor', TRUE);

INSERT INTO users (id, username, email, password_hash, name, role, college, is_onboarded, volunteer_type, availability, training_completed) VALUES
('volunteer-001', 'volunteer1', 'kavya@example.com', '$2b$10$example_hash', 'Kavya Nair', 'volunteer', 'CampusMinds University', TRUE, 'Peer Support', 'Weekdays 6-9 PM', TRUE),
('volunteer-002', 'volunteer2', 'amit@example.com', '$2b$10$example_hash', 'Amit Joshi', 'volunteer', 'CampusMinds University', TRUE, 'Crisis Support', 'Weekends 2-6 PM', TRUE),
('volunteer-003', 'volunteer3', 'sneha@example.com', '$2b$10$example_hash', 'Sneha Das', 'volunteer', 'CampusMinds University', TRUE, 'Academic Stress', 'Daily 7-10 PM', TRUE);

INSERT INTO users (id, username, email, password_hash, name, role, college, is_onboarded) VALUES
('admin-001', 'admin1', 'vikram@example.com', '$2b$10$example_hash', 'Dr. Vikram Agarwal', 'admin', 'CampusMinds University', TRUE),
('admin-002', 'admin2', 'sunita@example.com', '$2b$10$example_hash', 'Sunita Mehta', 'admin', 'CampusMinds University', TRUE);