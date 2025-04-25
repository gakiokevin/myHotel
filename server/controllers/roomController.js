import { pool } from "../config/database.js";

export const getRooms = async (req, res) => {
  try {
    const rooms = await pool.execute('SELECT * FROM Rooms');
    
    res.json(rooms);
  } catch (error) {
    console.error('Get rooms error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const createRoom = async (req, res) => {
  // { room_number: "R050", room_type: "Single", price_per_night: 200, status: "Available", floor_number: 1, max_occupancy: 1 }
  const { room_number, room_type, price_per_night, status,floor_number,max_occupancy = 'Available' } = req.body;

  try {
    // Validate input
    if (!room_number || !room_type || !price_per_night || !status || !floor_number || !max_occupancy) {
      return res.status(400).json({ error: 'Room number, type, and price are required' });
    }

    // Check if room number already exists
    const existingRooms = await pool.execute(
      'SELECT id FROM Rooms WHERE room_number = ?',
      [room_number]
    );

    if (existingRooms.length > 0) {
      return res.status(400).json({ error: 'Room number already exists' });
    }

    const result = await pool.execute(
      'INSERT INTO Rooms (room_number, room_type, price_per_night, status ,floor_number, max_occupancy) VALUES (?, ?,?, ?, ?, ?)',
      [ room_number, room_type, price_per_night, status,floor_number,max_occupancy]
    );
      let roomId = Number(result.insertId)
    

    res.status(201).json({
    message:'Room succesful created'
    });
  } catch (error) {
    console.error('Create room error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateRoom = async (req, res) => {
  const { id } = req.params;
  const {  room_number, room_type, price_per_night, status,floor_number,max_occupancy} = req.body;

  try {
    // Validate input
    if (!room_number || !room_type || !price_per_night || !status || !floor_number || !max_occupancy ) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    // Check if room exists
    const existingRooms = await pool.execute(
      'SELECT id FROM Rooms WHERE id = ?',
      [id]
    );
    console.log(existingRooms)

    if (!existingRooms.length) {
      return res.status(404).json({ error: 'Room not found' });
    }

    await pool.execute( 
      'UPDATE Rooms SET room_number = ?, room_type = ?, status = ? , price_per_night = ?, max_occupancy = ?, floor_number = ? WHERE id = ?',
      [ room_number, room_type, status, price_per_night, max_occupancy, floor_number, Number(id)]
    );

    res.status(200).json({ message: 'Room updated successfully' });
  } catch (error) {
    console.error('Update room error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
export const deleteRoom = async (req, res) => {
  const { id } = req.params;
  console.log(id)

  try {
    // 1. Quick existence check (still important)
    const [existingRooms] = await pool.execute(
      'SELECT id FROM Rooms WHERE id = ?',
      [id]
    );

    if (existingRooms.length === 0) {
      return res.status(404).json({ error: 'Room not found' });
    }

    // 2. Direct deletion (no occupancy check since frontend filters)
    await pool.execute('DELETE FROM Rooms WHERE id = ?', [id]);

    res.status(200).json({ message: 'Room deleted successfully' });
    
  } catch (error) {
    console.error('Delete room error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};


export const getAvailableRooms = async (req, res) => {
  try {
    const rooms = await pool.execute(
      'SELECT * FROM Rooms WHERE status = "Available"'
    );
    res.json(rooms);
  } catch (error) {
    console.error('Get available rooms error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
