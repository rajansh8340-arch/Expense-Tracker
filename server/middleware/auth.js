import jwt from 'jsonwebtoken';
import { User } from '../models/models.js';

export const protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Authentication required. No token provided.' });
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: 'Authentication token is missing.' });
    }

    const secret = process.env.JWT_SECRET || 'super_secret_ledgerly_jwt_key_2026_dev';
    const decoded = jwt.verify(token, secret);
    
    // Attach basic user payload
    req.user = { id: decoded.id };
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Session expired. Please sign in again.' });
    }
    return res.status(401).json({ message: 'Invalid authentication token.' });
  }
};
