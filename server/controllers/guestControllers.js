import { pool } from "../config/database.js";
export const getAllGuests = async (req, res) => {
    let conn;
    try {
      conn = await pool.getConnection();
      const rows = await conn.query(`
        SELECT 
          id,
          CONCAT(first_name, ' ', last_name) AS name,
          phone,
          email,
          id_type,
          id_number
        FROM Guests
        ORDER BY last_name ASC, first_name ASC
      `);
      res.json(rows);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Failed to fetch guests' });
    } finally {
      if (conn) conn.release();
    }
  };
  