import express from 'express'
 const router = express.Router();
import { authenticateToken, isReceptionist }  from '../middleware/auth.js'

import { processCheckIn } from '../controllers/checkInController.js';
router.post('/',authenticateToken,isReceptionist,processCheckIn)

export const checkInRoute = router

 