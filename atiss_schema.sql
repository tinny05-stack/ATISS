CREATE DATABASE IF NOT EXISTS atiss_schema;
USE atiss_schema;

-- ----------------------------
-- Table structure for clients
-- ----------------------------
DROP TABLE IF EXISTS clients;
CREATE TABLE clients (
    client_id INT AUTO_INCREMENT PRIMARY KEY,
    phone VARCHAR(20) NOT NULL UNIQUE,
    issued_on DATETIME NOT NULL,
    expiry_time DATETIME NOT NULL,
    status ENUM('active', 'expired') DEFAULT 'active'
);

-- ----------------------------
-- Table structure for payments
-- ----------------------------
DROP TABLE IF EXISTS payments;
CREATE TABLE payments (
    payment_id INT AUTO_INCREMENT PRIMARY KEY,
    phone VARCHAR(20) NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    provider ENUM('vodacom','tigo','airtel') NOT NULL,
    status ENUM('pending','success','failed') DEFAULT 'pending',
    transaction_id VARCHAR(100),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- ----------------------------
-- Table structure for otp_requests
-- ----------------------------
DROP TABLE IF EXISTS otp_requests;
CREATE TABLE otp_requests (
    otp_id INT AUTO_INCREMENT PRIMARY KEY,
    phone VARCHAR(20) NOT NULL,
    otp_code VARCHAR(6) NOT NULL,
    verified BOOLEAN DEFAULT FALSE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    expires_at DATETIME NOT NULL
);

-- ----------------------------
-- Table structure for admins
-- ----------------------------
DROP TABLE IF EXISTS admins;
CREATE TABLE admins (
    admin_id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
