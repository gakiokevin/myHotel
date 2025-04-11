import { pool } from "../server/config/database.js";
async function createRooms() {
  try {
    const roomTypes = ['Single', 'Double', 'Suite'];
    const statuses = ['Available', 'Occupied', 'Maintenance'];

    const connection = await pool.getConnection();

    for (let i = 1; i <= 60; i++) {
      const roomNumber = `R${i.toString().padStart(3, '0')}`; // Example: R001, R002...
      const roomType = roomTypes[Math.floor(Math.random() * roomTypes.length)];
      const status = 'Available'
      const pricePerNight = (Math.random() * (300 - 50) + 50).toFixed(2); // Random price between $50-$300
      const maxOccupancy = roomType === 'Suite' ? 4 : roomType === 'Double' ? 2 : 1;
      const floorNumber = Math.floor(Math.random() * 5) + 1; // Floors 1-5

      await connection.execute(
        'INSERT INTO Rooms (room_number, room_type, status, price_per_night, max_occupancy, floor_number) VALUES (?, ?, ?, ?, ?, ?)',
        [roomNumber, roomType, status, pricePerNight, maxOccupancy, floorNumber]
      );
      console.log(`Room ${roomNumber} inserted.`);
    }

    connection.release();
    console.log('All rooms created successfully.');
    process.exit(0);
  } catch (error) {
    console.error('Error creating rooms:', error);
    process.exit(1);
  }
}

createRooms();






















// CREATE TABLE Rooms (
//     id INT AUTO_INCREMENT PRIMARY KEY,
//     room_number VARCHAR(10) UNIQUE NOT NULL,
//     room_type ENUM('Single', 'Double', 'Suite') NOT NULL,
//     status ENUM('Available', 'Occupied', 'Maintenance') DEFAULT 'Available',
//     price_per_night DECIMAL(10,2) NOT NULL,
//     max_occupancy INT NOT NULL,
//     floor_number TINYINT NOT NULL,
//     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
//     updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
//     INDEX idx_rooms_status (status), -- Critical for availability checks
//     INDEX idx_rooms_type (room_type), -- For room-type queries
//     INDEX idx_rooms_floor (floor_number) -- Floor-based operations
//   ) ENGINE=InnoDB;