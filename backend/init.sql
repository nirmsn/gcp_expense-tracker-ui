-- -------------------------------------------------------
-- Database initialisation + seed data
-- Runs automatically when MySQL container starts fresh
-- -------------------------------------------------------
CREATE DATABASE IF NOT EXISTS expense_db
  CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE expense_db;

-- Users
CREATE TABLE IF NOT EXISTS users (
    id            INT           AUTO_INCREMENT PRIMARY KEY,
    name          VARCHAR(100)  NOT NULL,
    email         VARCHAR(255)  UNIQUE NOT NULL,
    password_hash VARCHAR(255)  NOT NULL,
    created_at    TIMESTAMP     DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Categories (shared / global)
CREATE TABLE IF NOT EXISTS categories (
    id    INT          AUTO_INCREMENT PRIMARY KEY,
    name  VARCHAR(100) NOT NULL,
    color VARCHAR(20)  DEFAULT '#6366f1'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Expenses
CREATE TABLE IF NOT EXISTS expenses (
    id           INT            AUTO_INCREMENT PRIMARY KEY,
    user_id      INT            NOT NULL,
    title        VARCHAR(255)   NOT NULL,
    amount       DECIMAL(10,2)  NOT NULL,
    category_id  INT            DEFAULT NULL,
    expense_date DATE           NOT NULL,
    note         TEXT,
    created_at   TIMESTAMP      DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id)     REFERENCES users(id)      ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Seed categories (idempotent)
INSERT IGNORE INTO categories (id, name, color) VALUES
    (1, 'Food',          '#f59e0b'),
    (2, 'Transport',     '#3b82f6'),
    (3, 'Shopping',      '#ec4899'),
    (4, 'Health',        '#10b981'),
    (5, 'Entertainment', '#8b5cf6'),
    (6, 'Utilities',     '#64748b'),
    (7, 'Other',         '#6366f1');

-- Demo user  (password: demo1234)
-- Hash generated with werkzeug.security.generate_password_hash('demo1234')
INSERT IGNORE INTO users (id, name, email, password_hash) VALUES
    (1, 'Demo User', 'demo@example.com',
     'scrypt:32768:8:1$salt00000000000000000$placeholder_replace_at_runtime');

-- Sample expenses for demo user
INSERT IGNORE INTO expenses (id, user_id, title, amount, category_id, expense_date, note) VALUES
    (1,  1, 'Office lunch',        250.00, 1, CURDATE() - INTERVAL 1 DAY,  'Team lunch'),
    (2,  1, 'Metro pass',          200.00, 2, CURDATE() - INTERVAL 2 DAY,  'Monthly pass'),
    (3,  1, 'Groceries',           850.50, 3, CURDATE() - INTERVAL 3 DAY,  'Weekly grocery run'),
    (4,  1, 'Pharmacy',            320.00, 4, CURDATE() - INTERVAL 5 DAY,  'Medicine'),
    (5,  1, 'Movie tickets',       450.00, 5, CURDATE() - INTERVAL 7 DAY,  'Weekend outing'),
    (6,  1, 'Electricity bill',   1200.00, 6, CURDATE() - INTERVAL 10 DAY, 'Monthly bill'),
    (7,  1, 'Breakfast',            95.00, 1, CURDATE() - INTERVAL 1 DAY,  NULL),
    (8,  1, 'Cab to airport',      750.00, 2, CURDATE() - INTERVAL 4 DAY,  NULL),
    (9,  1, 'Book – Clean Code',   499.00, 7, CURDATE() - INTERVAL 6 DAY,  'O''Reilly'),
    (10, 1, 'Internet bill',       999.00, 6, CURDATE() - INTERVAL 15 DAY, NULL);
