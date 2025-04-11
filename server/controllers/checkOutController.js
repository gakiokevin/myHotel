import { pool } from '../config/database.js';
import { generateReceiptNumber } from '../utils/receiptGenerator.js';
// POST /api/check-out
export const processCheckOut = async (req, res) => {
    const { booking_id, payment, damage_report } = req.body;
    let conn;
    let receiptNumber
  
    try {

    
      conn = await pool.getConnection();
      await conn.beginTransaction();
      // booking_id INT NOT NULL,
      // amount DECIMAL(10,2) NOT NULL,
      // payment_method ENUM('cash', 'mpesa') NOT NULL,
      // transaction_id VARCHAR(100),
      // receipt_number VARCHAR(50), 
      // paid_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      // collected_by INT NOT NULL, -- User who collected the payment
  
      // // 1. Process payment if unpaid
      if (payment) {
        receiptNumber = generateReceiptNumber(booking_id)
        await conn.query(
          `INSERT INTO Payments (booking_id, amount, payment_method, transaction_id,receipt_number,collected_by)
           VALUES (?, ?, ?, ?,?,?)`,
          [booking_id, payment.amount, payment.method, payment.transaction_id,receiptNumber,req.user.id]
        );
  
        await conn.query(
          `UPDATE Bookings SET payment_status = 'Paid' WHERE id = ?`,
          [booking_id]
        );
      }
  
      // 2. Record damage if reported
      if (damage_report) {
        await conn.query(
          `INSERT INTO DamageReports (
            booking_id, description, severity, repair_cost
           ) VALUES (?, ?, ?, ?)`,
          [
            booking_id,
            damage_report.description,
            damage_report.severity,
            damage_report.repair_cost || null
          ]
        );
      }
  
      // 3. Update booking status
      await conn.query(
        `UPDATE Bookings SET status = 'Checked-out', check_out_date = NOW() 
         WHERE id = ?`,
        [booking_id]
      );
  
      // 4. Free up the room
      await conn.query(
        `UPDATE Rooms r
         JOIN Bookings b ON r.id = b.room_id
         SET r.status = 'Available'
         WHERE b.id = ?`,
        [booking_id]
      );
  
      await conn.commit();
      res.json({ success: true,receiptNumber:receiptNumber });
    } catch (err) {
      if (conn) await conn.rollback();
      console.error(err);
      res.status(500).json({ 
        error: 'Check-out failed',
        details: err.message 
      });
    } finally {
      if (conn) conn.release();
    }
  };