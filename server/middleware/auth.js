import jwt from "jsonwebtoken";

export const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key', (err, {user}) => {
    if (err) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    req.user = user;
    next();
  }); 
};

export const isOwner = (req, res, next) => {
   const {role} = req.user
  if (req.user && role !== 'owner') {
    return res.status(403).json({ error: 'Access denied. Owner privileges required.' });
  }
  next();
};

export const isReceptionist = (req, res, next) => {
  const { role } = req.user;
  
  if (!['receptionist', 'owner'].includes(role)) {
    return res.status(403).json({ error: 'Access denied. Receptionist privileges required.' });
  }

  next();
};


