-- ========================
-- 1. USERS TABLE
-- ========================
CREATE TABLE Users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  first_name VARCHAR(50) NOT NULL,
  last_name VARCHAR(50) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('owner', 'receptionist') NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_users_email (email), -- Faster login lookups
  INDEX idx_users_role (role) -- For role-based queries
) ENGINE=InnoDB;

-- ========================
-- 2. GUESTS TABLE
-- ========================
CREATE TABLE Guests (
  id INT AUTO_INCREMENT PRIMARY KEY,
  first_name VARCHAR(50) NOT NULL,
  last_name VARCHAR(50) NOT NULL,
  phone VARCHAR(20) NOT NULL,
  email VARCHAR(100),
  id_type ENUM('Passport', 'National ID', 'Driver License') NOT NULL,
  id_number VARCHAR(50) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_guests_phone (phone), -- Quick search by phone
  INDEX idx_guests_id (id_type, id_number), -- For ID verification
  INDEX idx_guests_name (last_name, first_name) -- Name-based searches
) ENGINE=InnoDB;

-- ========================
-- 3. ROOMS TABLE
-- ========================
CREATE TABLE Rooms (
  id INT AUTO_INCREMENT PRIMARY KEY,
  room_number VARCHAR(10) UNIQUE NOT NULL,
  room_type ENUM('Single', 'Double', 'Suite') NOT NULL,
  status ENUM('Available', 'Occupied', 'Maintenance') DEFAULT 'Available',
  price_per_night DECIMAL(10,2) NOT NULL,
  max_occupancy INT NOT NULL,
  floor_number TINYINT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_rooms_status (status), -- Critical for availability checks
  INDEX idx_rooms_type (room_type), -- For room-type queries
  INDEX idx_rooms_floor (floor_number) -- Floor-based operations
) ENGINE=InnoDB;

-- ========================
-- 4. BOOKINGS TABLE (CORE)
-- ========================
CREATE TABLE Bookings (
  id INT AUTO_INCREMENT PRIMARY KEY,
  guest_id INT NOT NULL,
  room_id INT NOT NULL,
  check_in_date DATETIME NOT NULL,
  check_out_date DATETIME,
  status ENUM('Pending', 'Checked-in', 'Checked-out', 'Cancelled') DEFAULT 'Pending',
  payment_status ENUM('Paid', 'Pending', 'Unpaid') DEFAULT 'Unpaid',
  total_amount DECIMAL(10,2) NOT NULL,
  created_by INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (guest_id) REFERENCES Guests(id) ON DELETE RESTRICT,
  FOREIGN KEY (room_id) REFERENCES Rooms(id) ON DELETE RESTRICT,
  FOREIGN KEY (created_by) REFERENCES Users(id) ON DELETE RESTRICT,
  INDEX idx_bookings_dates (check_in_date, check_out_date), -- Date range queries
  INDEX idx_bookings_status (status), -- Frequent filter
  INDEX idx_bookings_payment (payment_status), -- Payment tracking
  INDEX idx_bookings_guest (guest_id), -- Guest history
  INDEX idx_bookings_room (room_id) -- Room assignment tracking
) ENGINE=InnoDB;

-- ========================
-- 5. PAYMENTS TABLE
-- ========================
CREATE TABLE Payments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  booking_id INT NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  payment_method ENUM('cash', 'mpesa') NOT NULL,
  transaction_id VARCHAR(100),
  receipt_number VARCHAR(50), 
  paid_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  collected_by INT NOT NULL, -- User who collected the payment
  FOREIGN KEY (booking_id) REFERENCES Bookings(id) ON DELETE CASCADE,
  FOREIGN KEY (collected_by) REFERENCES Users(id) ON DELETE RESTRICT,
  INDEX idx_payments_method (payment_method), 
  INDEX idx_payments_transaction (transaction_id),
  INDEX idx_payments_date (paid_at) 
) ENGINE=InnoDB;

-- ====================================================
-- DAmage table
-- =====================================================
CREATE TABLE DamageReports (
  id INT AUTO_INCREMENT PRIMARY KEY,
  booking_id INT NOT NULL,
  description TEXT NOT NULL,
  severity ENUM('low', 'medium', 'high') NOT NULL,
  repair_cost DECIMAL(10,2),
  reported_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (booking_id) REFERENCES Bookings(id)
);

CREATE TRIGGER before_insert_payments
BEFORE INSERT ON Payments
FOR EACH ROW
BEGIN
  SET NEW.receipt_number = CONCAT('RCPT-', DATE_FORMAT(NOW(), '%Y%m%d-'), LPAD(NEW.id, 6, '0'));
END 
