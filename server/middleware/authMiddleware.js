import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { AppError, asyncHandler } from './errorHandler.js';

const JWT_SECRET = process.env.JWT_SECRET || 'airbnb_super_secret_jwt_key_2026';

/**
 * Protect middleware: Ensures request is accompanied by a valid JWT token
 */
export const protect = asyncHandler(async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.headers['x-auth-token']) {
    token = req.headers['x-auth-token'];
  }

  if (!token) {
    return next(new AppError('Authentication required. Please log in to access this resource.', 401));
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password');

    if (!user) {
      return next(new AppError('The user belonging to this token no longer exists.', 401));
    }

    req.user = user;
    next();
  } catch (err) {
    return next(new AppError('Invalid or expired authentication token. Please log in again.', 401));
  }
});

/**
 * Optional auth middleware: Attaches req.user if a valid token is provided, but does not reject if missing.
 */
export const optionalAuth = asyncHandler(async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.headers['x-auth-token']) {
    token = req.headers['x-auth-token'];
  }

  if (!token) {
    return next();
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password');
    if (user) {
      req.user = user;
    }
  } catch {
    // If token invalid, proceed unauthenticated
  }

  next();
});
