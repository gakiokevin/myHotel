import express from 'express'
 const router = express.Router()
import { authenticateToken, isOwner } from '../middleware/auth.js';
import  { login, addEmployee,getEmployees,verifUser } from '../controllers/authController.js';


router.post('/login', login);
router.post('/employees',addEmployee);
router.get('/employees',getEmployees)
router.get('/me',verifUser)



export const authRoutes  = router