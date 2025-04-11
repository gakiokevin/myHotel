import express from 'express'
export const router = express.Router();
import { authenticateToken, isReceptionist }  from '../middleware/auth.js'
import { getActiveBookings } from '../controllers/bookingController.js';


router.get('/active',getActiveBookings)

export  const bookingRoutes = router