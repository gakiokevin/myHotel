import express from 'express'
 const router = express.Router();
import  { authenticateToken, isReceptionist } from '../middleware/auth.js'

import { getReceptionistStats } from '../controllers/dashboardController.js';

router.get('/stats', getReceptionistStats);

export const  dashboardRoutes = router