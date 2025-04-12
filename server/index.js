import dotenv from 'dotenv'
dotenv.config()
import express from 'express'
import cors from 'cors'

import { authRoutes} from './routes/auth.js'
import { bookingRoutes} from './routes/bookings.js'
import { dashboardRoutes} from './routes/dashboard.js'
import { roomRoutes } from './routes/rooms.js'
import { checkInRoute } from './routes/checkIn.js'
import { checkOutRoute } from './routes/checkOut.js'
import { guestRoutes } from './routes/guest.js'

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/analytics', dashboardRoutes);
app.use('/api/rooms', roomRoutes);
app.use('/api/check-in',checkInRoute)
app.use('/api/check-out',checkOutRoute)
app.use('/api/guests',guestRoutes)

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});