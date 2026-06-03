-- Aegis Capital Banking Transaction Management System
-- MySQL 9 Schema

CREATE DATABASE IF NOT EXISTS aegis_banking
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_unicode_ci;

USE aegis_banking;

CREATE TABLE IF NOT EXISTS users (
    id              BIGINT AUTO_INCREMENT PRIMARY KEY,
    full_name       VARCHAR(150) NOT NULL,
    email           VARCHAR(150) NOT NULL UNIQUE,
    phone_number    VARCHAR(20)  NOT NULL,
    password        VARCHAR(255) NOT NULL,
    role            ENUM('CUSTOMER', 'ADMIN') NOT NULL DEFAULT 'CUSTOMER',
    status          ENUM('ACTIVE', 'INACTIVE', 'SUSPENDED') NOT NULL DEFAULT 'ACTIVE',
    created_at      DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    updated_at      DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    created_by      VARCHAR(150),
    updated_by      VARCHAR(150),
    INDEX idx_users_email (email),
    INDEX idx_users_role (role)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS accounts (
    id                  BIGINT AUTO_INCREMENT PRIMARY KEY,
    account_number      VARCHAR(20) NOT NULL UNIQUE,
    account_type        ENUM('SAVINGS', 'CURRENT', 'BUSINESS', 'SALARY', 'FIXED_DEPOSIT') NOT NULL,
    balance             DECIMAL(19, 2) NOT NULL DEFAULT 0.00,
    minimum_balance     DECIMAL(19, 2) NOT NULL DEFAULT 0.00,
    overdraft_limit     DECIMAL(19, 2) NOT NULL DEFAULT 0.00,
    status              ENUM('ACTIVE', 'BLOCKED', 'CLOSED', 'FROZEN') NOT NULL DEFAULT 'ACTIVE',
    currency            VARCHAR(3) NOT NULL DEFAULT 'USD',
    user_id             BIGINT NOT NULL,
    daily_withdrawn     DECIMAL(19, 2) NOT NULL DEFAULT 0.00,
    last_withdrawal_date DATE,
    maturity_date       DATE,
    version             BIGINT NOT NULL DEFAULT 0,
    created_at          DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    updated_at          DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    created_by          VARCHAR(150),
    updated_by          VARCHAR(150),
    CONSTRAINT fk_accounts_user FOREIGN KEY (user_id) REFERENCES users(id),
    INDEX idx_accounts_user (user_id),
    INDEX idx_accounts_type (account_type),
    INDEX idx_accounts_status (status)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS transactions (
    id                  BIGINT AUTO_INCREMENT PRIMARY KEY,
    reference_number    VARCHAR(32) NOT NULL UNIQUE,
    sender_account      VARCHAR(20),
    receiver_account    VARCHAR(20),
    transaction_type    ENUM('DEPOSIT', 'WITHDRAW', 'TRANSFER', 'SELF_TRANSFER') NOT NULL,
    amount              DECIMAL(19, 2) NOT NULL,
    transaction_status  ENUM('SUCCESS', 'FAILED', 'PENDING', 'REVERSED') NOT NULL,
    description         VARCHAR(500),
    created_at          DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    created_by          VARCHAR(150),
    INDEX idx_txn_sender (sender_account),
    INDEX idx_txn_receiver (receiver_account),
    INDEX idx_txn_status (transaction_status),
    INDEX idx_txn_created (created_at),
    INDEX idx_txn_type (transaction_type)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS beneficiaries (
    id                          BIGINT AUTO_INCREMENT PRIMARY KEY,
    nickname                    VARCHAR(100) NOT NULL,
    beneficiary_account_number  VARCHAR(20) NOT NULL,
    bank_name                   VARCHAR(150) NOT NULL,
    ifsc_code                   VARCHAR(20) NOT NULL,
    user_id                     BIGINT NOT NULL,
    created_at                  DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    updated_at                  DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    CONSTRAINT fk_beneficiaries_user FOREIGN KEY (user_id) REFERENCES users(id),
    INDEX idx_beneficiaries_user (user_id)
) ENGINE=InnoDB;

-- Default admin user (password: Admin@123)
INSERT INTO users (full_name, email, phone_number, password, role, status, created_by)
SELECT 'System Administrator', 'admin@aegiscapital.com', '+1-555-0100',
       '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/X4.G2oX.HxKd0LHAk', 'ADMIN', 'ACTIVE', 'SYSTEM'
WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'admin@aegiscapital.com');
