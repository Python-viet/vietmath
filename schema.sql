-- Database Schema for Math Education Platform

CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  full_name VARCHAR(100),
  role VARCHAR(20) DEFAULT 'student', -- 'admin', 'student'
  grade_level INT, -- 6, 7, 8, 9
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS tests (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  grade_level INT NOT NULL,
  duration_minutes INT NOT NULL, -- 15, 45, 90
  created_by INT REFERENCES users(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS questions (
  id SERIAL PRIMARY KEY,
  test_id INT REFERENCES tests(id) ON DELETE CASCADE,
  question_text TEXT NOT NULL,
  option_a TEXT NOT NULL,
  option_b TEXT NOT NULL,
  option_c TEXT NOT NULL,
  option_d TEXT NOT NULL,
  correct_answer CHAR(1) NOT NULL, -- 'A', 'B', 'C', 'D'
  order_index INT
);

CREATE TABLE IF NOT EXISTS scores (
  id SERIAL PRIMARY KEY,
  user_id INT REFERENCES users(id) ON DELETE CASCADE,
  test_id INT REFERENCES tests(id) ON DELETE CASCADE,
  score FLOAT NOT NULL,
  total_questions INT NOT NULL,
  correct_answers INT NOT NULL,
  completed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
