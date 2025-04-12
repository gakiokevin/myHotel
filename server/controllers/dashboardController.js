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


export const getFullAnalytics = async (req, res) => {
  let connection;
  try {
    connection = await pool.getConnection();
    await connection.beginTransaction();

    const { range = 'week' } = req.query;
    const today = new Date();
    let startDate;

    // Set date range
    if (range === 'month') {
      startDate = new Date(today.getFullYear(), today.getMonth(), 1);
    } else { // default to week
      startDate = new Date(today);
      startDate.setDate(startDate.getDate() - 7);
    }

    // 1. Occupancy Rate Calculation
    const [occupancyData] = await connection.query(`
      SELECT 
        COUNT(DISTINCT b.id) AS occupied_rooms,
        (SELECT COUNT(*) FROM Rooms) AS total_rooms,
        DATEDIFF(?, ?) AS days_in_period
      FROM Bookings b
      WHERE b.check_in_date BETWEEN ? AND ?
      AND b.status IN ('Checked-in', 'Checked-out')
    `, [today, startDate, startDate, today]);

    

    const occupancyRate = Number(occupancyData.total_rooms) > 0 
      ? Math.round((Number(occupancyData.occupied_rooms) / Number(occupancyData.total_rooms)) * 100)
      : 0;

    // 2. Revenue Data
    const [revenueData] = await connection.query(`
      SELECT 
        SUM(total_amount) AS total_revenue,
        AVG(total_amount) AS average_rate
      FROM Bookings
      WHERE check_in_date BETWEEN ? AND ?
      AND status IN ('Checked-in', 'Checked-out')
    `, [startDate, today]);
   

    // 3. Popular Room Types
    const popularResponse = await connection.query(`
      SELECT 
        r.room_type AS type,
        COUNT(b.id) AS bookings
      FROM Bookings b
      JOIN Rooms r ON b.room_id = r.id
      WHERE b.check_in_date BETWEEN ? AND ?
      GROUP BY r.room_type
      ORDER BY bookings DESC
      LIMIT 5
    `, [startDate, today]);

    const popularRooms = popularResponse.map((room)=>({type:room.type,
      bookings:Number(room.bookings)
    }))
    
    

    // 4. Revenue by Date (for chart)
    const revenueByDate = await connection.query(`
      SELECT 
        DATE(b.check_in_date) AS date,
        SUM(b.total_amount) AS amount
      FROM Bookings b
      WHERE b.check_in_date BETWEEN ? AND ?
      AND b.status IN ('Checked-in', 'Checked-out')
      GROUP BY DATE(b.check_in_date)
      ORDER BY date ASC
    `, [startDate, today]);
    

    // 5. Guests by Date (for chart)
    const guestsByDate = await connection.query(`
      SELECT 
        DATE(b.check_in_date) AS date,
        COUNT(DISTINCT b.guest_id) AS count
      FROM Bookings b
      WHERE b.check_in_date BETWEEN ? AND ?
      GROUP BY DATE(b.check_in_date)
      ORDER BY date ASC
    `, [startDate, today]);

    await connection.commit();

    res.json({
      occupancyRate,
      totalRevenue: Number(revenueData.total_revenue) || 0,
      averageRate: Number(revenueData.average_rate) || 0,
      popularRooms,
      revenueByDate:revenueByDate.map((revenue)=>({date:revenue.date,amount:Number(revenue.amount)})),
      guestsByDate:guestsByDate.map((guest)=>({date:guest.date,count:Number(guest.count)}))
    });

  } catch (error) {
    console.error('Analytics error:', error);
    if (connection) {
      await connection.rollback();
      connection.release();
    }
    res.status(500).json({ error: 'Failed to load analytics data' });
  } finally {
    if (connection) connection.release();
  }
};