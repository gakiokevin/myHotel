import express from 'express'

import { getAllGuests } from "../controllers/guestControllers.js";

 
const router = express.Router()


router.get('/',getAllGuests)

export const guestRoutes = router