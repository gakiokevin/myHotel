import express from 'express'
export const router = express.Router();
import { authenticateToken, isReceptionist }  from '../middleware/auth.js'
import { getAllBookings,getActiveBookings } from '../controllers/bookingController.js';

router.get('/',getAllBookings)
router.get('/active',getActiveBookings)

export  const bookingRoutes = router