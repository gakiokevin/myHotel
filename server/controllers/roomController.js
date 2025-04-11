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
  const { room_number, type, price, status = 'available' } = req.body;

  try {
    // Validate input
    if (!room_number || !type || !price) {
      return res.status(400).json({ error: 'Room number, type, and price are required' });
    }

    // Check if room number already exists
    const existingRooms = await pool.execute(
      'SELECT id FROM rooms WHERE room_number = ?',
      [room_number]
    );

    if (existingRooms.length > 0) {
      return res.status(400).json({ error: 'Room number already exists' });
    }

    const result = await pool.execute(
      'INSERT INTO rooms (room_number, type, price, status) VALUES (?, ?, ?, ?)',
      [room_number, type, price, status]
    );
      let roomId = Number(result.insertId)
    

    res.status(201).json({
      id: roomId,
      room_number,
      type,
      price,
      status,
    });
  } catch (error) {
    console.error('Create room error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateRoom = async (req, res) => {
  const { id } = req.params;
  const { room_number, type, price, status } = req.body;

  try {
    // Validate input
    if (!room_number || !type || !price || !status) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    // Check if room exists
    const existingRooms = await pool.execute(
      'SELECT id FROM Rooms WHERE id = ?',
      [id]
    );

    if (!existingRooms.length) {
      return res.status(404).json({ error: 'Room not found' });
    }

    await pool.execute(
      'UPDATE Rooms SET room_number = ?, type = ?, price = ?, status = ? WHERE id = ?',
      [room_number, type, price, status, id]
    );

    res.json({
      id: parseInt(id),
      room_number,
      type,
      price,
      status,
    });
  } catch (error) {
    console.error('Update room error:', error);
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
