-- Migration: Add teacher_invites table for the invitation-based teacher linking system.
-- Run: mysql -u root -p timetable_genius_project < migrations/001_teacher_invites.sql

USE timetable_genius_project;

CREATE TABLE IF NOT EXISTS teacher_invites (
    invite_id       INT AUTO_INCREMENT PRIMARY KEY,
    admin_id        INT NOT NULL,
    teacher_email   VARCHAR(255) NOT NULL,
    teacher_user_id INT DEFAULT NULL,
    department_id   INT DEFAULT NULL,
    weekly_hours    INT NOT NULL DEFAULT 40,
    status          ENUM('pending', 'accepted', 'rejected') NOT NULL DEFAULT 'pending',
    created_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (admin_id)          REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (teacher_user_id)   REFERENCES users(user_id) ON DELETE SET NULL,
    FOREIGN KEY (department_id)     REFERENCES departments(department_id) ON DELETE SET NULL,
    INDEX idx_teacher_invites_admin   (admin_id),
    INDEX idx_teacher_invites_teacher (teacher_user_id),
    INDEX idx_teacher_invites_status  (status)
);
