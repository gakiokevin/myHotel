import express from 'express'
import { processCheckOut } from '../controllers/checkOutController.js';
import { authenticateToken,isReceptionist } from '../middleware/auth.js';
const router = express.Router();


router.post('/',authenticateToken, isReceptionist,processCheckOut);


export const checkOutRoute = router