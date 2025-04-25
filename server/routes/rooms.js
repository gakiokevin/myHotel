import express from 'express'
export const roomRoutes = express.Router();
import  { authenticateToken, isOwner } from '../middleware/auth.js';
import  {
  getRooms,
  createRoom,
  updateRoom,
  getAvailableRooms,
  deleteRoom
} from '../controllers/roomController.js';

roomRoutes.get('/', getRooms);
roomRoutes.get('/available', getAvailableRooms);
roomRoutes.post('/', createRoom);
roomRoutes.put('/:id', updateRoom);
roomRoutes.delete('/:id',deleteRoom)

