import { pool } from "../config/database.js";

export const getReceptionistStats = async (req, res) => {
  let connection;
  try {
    connection = await pool.getConnection();
    await connection.beginTransaction();

    // 1. Total Active Guests (not just booking count)
    const [totalCustomers] = await connection.query(`
      SELECT COUNT(DISTINCT guest_id) AS total 
      FROM Bookings 
      WHERE status IN ('Checked-in', 'Pending')
    `);

    // 2. Room Occupancy Stats (matches your schema's statuses)
    const roomStats = await connection.query(`
      SELECT 
        status, 
        COUNT(*) AS count,
        CONCAT(ROUND(COUNT(*) / (SELECT COUNT(*) FROM Rooms) * 100), '%') AS percentage
      FROM Rooms 
      GROUP BY status
    `);

    


    // 3. Recent Bookings (with guest/room details)
    const recentBookings = await connection.query(`
      SELECT 
        b.id, 
        b.check_in_date,
        b.status,
        CONCAT(g.first_name, ' ', g.last_name) AS guest_name,
        r.room_number,
        r.room_type
      FROM Bookings b
      JOIN Guests g ON b.guest_id = g.id
      JOIN Rooms r ON b.room_id = r.id
      ORDER BY b.created_at DESC
      LIMIT 5
    `);

    // 4. Pending Payments (using your Payments table schema)
    const [pendingPayments] = await connection.query(`
      SELECT COUNT(*) AS count 
      FROM Bookings 
      WHERE payment_status = 'Pending'
    `);

    await connection.commit();


    res.json({
      roomStats:roomStats.reduce((acc, { status, count, percentage }) => {
        acc[status] = { count: Number(count), percentage };
        return acc;
      }, {}),
      totalCustomers: Number(totalCustomers.total || 0),
      pendingPayments: Number(pendingPayments.count || 0),
      recentBookings:recentBookings,
    });

  } catch (error) {
    console.error('Dashboard stats error:', error);
    if (connection) {
      await connection.rollback();
      connection.release();
    }
    res.status(500).json({ error: 'Failed to load dashboard data' });
  } finally {
    if (connection) connection.release();
  }
};

