import { pool } from '../config/database.js';

// GET /api/bookings/active
export const getActiveBookings = async (req, res) => {
  let conn;
  try {
    conn = await pool.getConnection();
    const rows = await conn.query(`
      SELECT 
        b.id,
        CONCAT(g.first_name, ' ', g.last_name) AS guest_name,
        r.room_number,
        b.check_in_date,
        b.total_amount,
        b.payment_status
      FROM Bookings b
      JOIN Guests g ON b.guest_id = g.id
      JOIN Rooms r ON b.room_id = r.id
      WHERE b.status = 'Checked-in'
    `);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch active bookings' });
  } finally {
    if (conn) conn.release();
  }
};

