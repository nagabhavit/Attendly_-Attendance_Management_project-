-- Attendly database schema (MySQL 8+)
CREATE DATABASE IF NOT EXISTS attendly
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE attendly;

CREATE TABLE IF NOT EXISTS users (
  id                INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name              VARCHAR(100)  NOT NULL,
  email             VARCHAR(255)  NOT NULL UNIQUE,
  password_hash     VARCHAR(255)  NOT NULL,
  target_percentage TINYINT UNSIGNED NOT NULL DEFAULT 75,
  created_at        DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS subjects (
  id         INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id    INT UNSIGNED NOT NULL,
  name       VARCHAR(100) NOT NULL,
  code       VARCHAR(20)  NULL,
  color      VARCHAR(7)   NOT NULL DEFAULT '#6366f1',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_subjects_user FOREIGN KEY (user_id)
    REFERENCES users (id) ON DELETE CASCADE,
  INDEX idx_subjects_user (user_id)
);

CREATE TABLE IF NOT EXISTS attendance (
  id         INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  subject_id INT UNSIGNED NOT NULL,
  class_date DATE NOT NULL,
  status     ENUM('present', 'absent') NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_attendance_subject FOREIGN KEY (subject_id)
    REFERENCES subjects (id) ON DELETE CASCADE,
  -- one record per subject per day; re-marking updates it
  UNIQUE KEY uq_attendance_subject_date (subject_id, class_date)
);
