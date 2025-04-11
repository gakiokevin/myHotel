// controllers/checkIn.js
import { pool } from "../config/database.js";
import { generateReceiptNumber } from "../utils/receiptGenerator.js";


export const processCheckIn = async (req, res) => {
  const {
    guest,
    room_id,
    amount,
    payment_type,
    payment_method,
    transaction_id
  } = req.body;

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    

    // 1. Insert or find guest
    const guestResult = await conn.query(
      `INSERT INTO Guests (first_name, last_name, phone, email, id_type, id_number)
       VALUES (?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE id=LAST_INSERT_ID(id)`,
      [
        guest.first_name,
        guest.last_name,
        guest.phone,
        guest.email || null,
        guest.id_type,
        guest.id_number
      ]
    );
    const guest_id = Number(guestResult.insertId);

    // 2. Create booking
    const bookingResult = await conn.query(
      `INSERT INTO Bookings (
        guest_id, room_id, check_in_date, status, payment_status,total_amount
       ) VALUES (?, ?, NOW(), 'Checked-in', ?, ?)`,
      [
        guest_id,
        room_id,
        payment_type === 'now' ? 'Paid' : 'Unpaid',
        amount
      ]
    );

    const booking_id =Number(bookingResult.insertId);
    let receiptNumber = generateReceiptNumber(booking_id)

    // // 3. Record payment if paid now
    if (payment_type === 'now') {
      await conn.query(
        `INSERT INTO Payments (booking_id, amount, payment_method, transaction_id,receipt_number,collected_by)
         VALUES (?, ?, ?, ?,?,?)`,
        [booking_id,(await conn.query(`SELECT price_per_night FROM Rooms WHERE id = ?`, [room_id]))[0].price_per_night,payment_method, transaction_id || null,receiptNumber,req.user.id]
      );




      
      
    }

    // // 4. Update room status
    await conn.query(
      `UPDATE Rooms SET status = 'Occupied' WHERE id = ?`,
      [room_id]
    );

    await conn.commit();
    res.json({success: true, receiptNumber:receiptNumber});
    
  } catch (err) {
    await conn.rollback();
    res.status(500).json({ error: err.message });
  } finally {
    conn.release();
  }
};