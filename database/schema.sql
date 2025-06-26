-- Online Learning Platform Database Schema
-- SQLite Database Design

-- Enable foreign key constraints

PRAGMA foreign_keys = ON;

-- Users table (Learners) from ds
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    mobile TEXT,
    target_exam TEXT,
    preferred_language TEXT DEFAULT 'English',
    preparation_level TEXT DEFAULT 'Beginner',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Educators table
CREATE TABLE if not exists educators (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    mobile TEXT,
    qualification TEXT,
    experience INTEGER,
    bio TEXT,
    rating REAL DEFAULT 0.0,
    is_verified BOOLEAN DEFAULT FALSE,
    image_url TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Educator subjects junction table
CREATE TABLE IF NOT EXISTS educator_subjects (
    educator_id INTEGER,
    subject TEXT NOT NULL,
    PRIMARY KEY (educator_id, subject),
    FOREIGN KEY (educator_id) REFERENCES educators(id) ON DELETE CASCADE
);

-- Courses table
CREATE TABLE IF NOT EXISTS courses (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT,
    educator_id INTEGER,
    target_exam TEXT,
    duration TEXT,
    validity TEXT,
    total_lessons INTEGER DEFAULT 0,
    price INTEGER,
    highlights TEXT, 
    features TEXT,
    discounted_price INTEGER,
    type TEXT CHECK(type IN ('recorded', 'live')),
    language TEXT,
    thumbnail TEXT,
    rating REAL DEFAULT 0.0,
    enrolled_students INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (educator_id) REFERENCES educators(id)
);

-- Course chapters/modules
CREATE TABLE IF NOT EXISTS course_chapters (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    course_id INTEGER NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    order_index INTEGER NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (course_id) REFERENCES courses (id) ON DELETE CASCADE
);

-- Lessons table
CREATE TABLE IF NOT EXISTS lessons (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    course_id INTEGER NOT NULL,
    chapter_id INTEGER,
    title TEXT NOT NULL,
    description TEXT,
    video_url TEXT,
    duration_seconds INTEGER,
    order_index INTEGER NOT NULL,
    is_free BOOLEAN DEFAULT FALSE,
    resources TEXT, -- JSON array of resources
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (course_id) REFERENCES courses (id) ON DELETE CASCADE,
    FOREIGN KEY (chapter_id) REFERENCES course_chapters (id) ON DELETE SET NULL
);

-- Enrollments table
CREATE TABLE IF NOT EXISTS enrollments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    course_id INTEGER NOT NULL,
    enrolled_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    expires_at DATETIME,
    progress_percentage REAL DEFAULT 0.0,
    last_accessed DATETIME,
    is_active BOOLEAN DEFAULT TRUE,
    purchase_price REAL,
    payment_method TEXT,
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
    FOREIGN KEY (course_id) REFERENCES courses (id) ON DELETE CASCADE,
    UNIQUE(user_id, course_id)
);

-- Watch history table
CREATE TABLE IF NOT EXISTS watch_history (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    lesson_id INTEGER NOT NULL,
    watched_duration INTEGER DEFAULT 0,
    total_duration INTEGER,
    completed BOOLEAN DEFAULT FALSE,
    last_watched_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
    FOREIGN KEY (lesson_id) REFERENCES lessons (id) ON DELETE CASCADE,
    UNIQUE(user_id, lesson_id)
);

-- Live classes table
CREATE TABLE IF NOT EXISTS live_classes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    course_id INTEGER NOT NULL,
    educator_id INTEGER NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    scheduled_at DATETIME NOT NULL,
    duration_minutes INTEGER DEFAULT 60,
    max_students INTEGER DEFAULT 500,
    join_url TEXT,
    recording_url TEXT,
    status TEXT DEFAULT 'scheduled', -- 'scheduled', 'live', 'completed', 'cancelled'
    chat_enabled BOOLEAN DEFAULT TRUE,
    polls_enabled BOOLEAN DEFAULT TRUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (course_id) REFERENCES courses (id) ON DELETE CASCADE,
    FOREIGN KEY (educator_id) REFERENCES educators (id)
);

-- Live class attendance
CREATE TABLE IF NOT EXISTS live_class_attendance (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    live_class_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    joined_at DATETIME,
    left_at DATETIME,
    duration_minutes INTEGER DEFAULT 0,
    FOREIGN KEY (live_class_id) REFERENCES live_classes (id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
    UNIQUE(live_class_id, user_id)
);

-- Tests table
CREATE TABLE IF NOT EXISTS tests (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    course_id INTEGER,
    title TEXT NOT NULL,
    description TEXT,
    type TEXT NOT NULL, -- 'practice', 'mock', 'chapter'
    subject TEXT,
    total_questions INTEGER NOT NULL,
    duration_minutes INTEGER NOT NULL,
    max_marks INTEGER NOT NULL,
    negative_marking BOOLEAN DEFAULT TRUE,
    difficulty TEXT DEFAULT 'medium', -- 'easy', 'medium', 'hard'
    instructions TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (course_id) REFERENCES courses (id) ON DELETE SET NULL
);

-- Test questions
CREATE TABLE IF NOT EXISTS test_questions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    test_id INTEGER NOT NULL,
    question TEXT NOT NULL,
    options TEXT NOT NULL, -- JSON array of options
    correct_option INTEGER NOT NULL,
    explanation TEXT,
    marks INTEGER DEFAULT 1,
    negative_marks REAL DEFAULT 0,
    subject TEXT,
    topic TEXT,
    difficulty TEXT DEFAULT 'medium',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (test_id) REFERENCES tests (id) ON DELETE CASCADE
);

-- Test attempts
CREATE TABLE IF NOT EXISTS test_attempts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    test_id INTEGER NOT NULL,
    session_id TEXT UNIQUE NOT NULL,
    started_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    submitted_at DATETIME,
    time_spent_seconds INTEGER,
    total_score REAL DEFAULT 0,
    max_score INTEGER,
    percentage REAL DEFAULT 0,
    rank_position INTEGER,
    percentile REAL,
    answers TEXT, -- JSON object of answers
    analysis TEXT, -- JSON object of subject-wise analysis
    status TEXT DEFAULT 'started', -- 'started', 'submitted', 'expired'
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
    FOREIGN KEY (test_id) REFERENCES tests (id) ON DELETE CASCADE
);

-- Subscription plans
CREATE TABLE IF NOT EXISTS subscription_plans (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    description TEXT,
    price REAL NOT NULL,
    duration_days INTEGER NOT NULL,
    features TEXT NOT NULL, -- JSON array of features
    max_courses INTEGER,
    priority_support BOOLEAN DEFAULT FALSE,
    offline_download BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- User subscriptions
CREATE TABLE IF NOT EXISTS user_subscriptions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    plan_id INTEGER NOT NULL,
    started_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    expires_at DATETIME NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    payment_amount REAL,
    payment_method TEXT,
    payment_id TEXT,
    auto_renewal BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
    FOREIGN KEY (plan_id) REFERENCES subscription_plans (id)
);

-- Doubts/Questions
CREATE TABLE IF NOT EXISTS doubts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    course_id INTEGER,
    lesson_id INTEGER,
    question TEXT NOT NULL,
    attachments TEXT, -- JSON array of attachment URLs
    status TEXT DEFAULT 'pending', -- 'pending', 'answered', 'resolved'
    priority TEXT DEFAULT 'normal', -- 'low', 'normal', 'high'
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
    FOREIGN KEY (course_id) REFERENCES courses (id) ON DELETE SET NULL,
    FOREIGN KEY (lesson_id) REFERENCES lessons (id) ON DELETE SET NULL
);

-- Doubt answers
CREATE TABLE IF NOT EXISTS doubt_answers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    doubt_id INTEGER NOT NULL,
    educator_id INTEGER NOT NULL,
    answer TEXT NOT NULL,
    attachments TEXT, -- JSON array of attachment URLs
    is_accepted BOOLEAN DEFAULT FALSE,
    upvotes INTEGER DEFAULT 0,
    downvotes INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (doubt_id) REFERENCES doubts (id) ON DELETE CASCADE,
    FOREIGN KEY (educator_id) REFERENCES educators (id)
);

-- Study materials
CREATE TABLE IF NOT EXISTS study_materials (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    course_id INTEGER NOT NULL,
    chapter_id INTEGER,
    title TEXT NOT NULL,
    description TEXT,
    type TEXT NOT NULL, -- 'pdf', 'video', 'audio', 'document'
    file_url TEXT NOT NULL,
    file_size INTEGER,
    download_count INTEGER DEFAULT 0,
    is_downloadable BOOLEAN DEFAULT TRUE,
    requires_subscription BOOLEAN DEFAULT FALSE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (course_id) REFERENCES courses (id) ON DELETE CASCADE,
    FOREIGN KEY (chapter_id) REFERENCES course_chapters (id) ON DELETE SET NULL
);

-- Material downloads tracking
CREATE TABLE IF NOT EXISTS material_downloads (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    material_id INTEGER NOT NULL,
    downloaded_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
    FOREIGN KEY (material_id) REFERENCES study_materials (id) ON DELETE CASCADE
);

-- Course reviews
CREATE TABLE IF NOT EXISTS course_reviews (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    course_id INTEGER NOT NULL,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    review TEXT,
    is_verified_purchase BOOLEAN DEFAULT FALSE,
    helpful_count INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
    FOREIGN KEY (course_id) REFERENCES courses (id) ON DELETE CASCADE,
    UNIQUE(user_id, course_id)
);

-- Educator followers
CREATE TABLE IF NOT EXISTS educator_followers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    educator_id INTEGER NOT NULL,
    followed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
    FOREIGN KEY (educator_id) REFERENCES educators (id) ON DELETE CASCADE,
    UNIQUE(user_id, educator_id)
);

-- User notes
CREATE TABLE IF NOT EXISTS lesson_notes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    lesson_id INTEGER NOT NULL,
    timestamp_seconds INTEGER NOT NULL,
    note TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
    FOREIGN KEY (lesson_id) REFERENCES lessons (id) ON DELETE CASCADE
);

-- User achievements/badges
CREATE TABLE IF NOT EXISTS user_achievements (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    achievement_type TEXT NOT NULL, -- 'streak', 'course_completion', 'test_score', etc.
    achievement_data TEXT, -- JSON data about the achievement
    earned_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
);

-- Analytics tracking
CREATE TABLE IF NOT EXISTS user_analytics (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    event_type TEXT NOT NULL, -- 'login', 'video_watch', 'test_attempt', etc.
    event_data TEXT, -- JSON data about the event
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_educators_email ON educators(email);
CREATE INDEX IF NOT EXISTS idx_courses_educator ON courses(educator_id);
CREATE INDEX IF NOT EXISTS idx_courses_exam ON courses(target_exam);
CREATE INDEX IF NOT EXISTS idx_lessons_course ON lessons(course_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_user ON enrollments(user_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_course ON enrollments(course_id);
CREATE INDEX IF NOT EXISTS idx_watch_history_user ON watch_history(user_id);
CREATE INDEX IF NOT EXISTS idx_watch_history_lesson ON watch_history(lesson_id);
CREATE INDEX IF NOT EXISTS idx_test_attempts_user ON test_attempts(user_id);
CREATE INDEX IF NOT EXISTS idx_course_reviews_course ON course_reviews(course_id);
CREATE INDEX IF NOT EXISTS idx_doubts_user ON doubts(user_id);
CREATE INDEX IF NOT EXISTS idx_live_classes_course ON live_classes(course_id);