import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import User from '../models/User.js';
import { AppError, asyncHandler } from '../middleware/errorHandler.js';

const JWT_SECRET = process.env.JWT_SECRET || 'airbnb_super_secret_jwt_key_2026';
const DEFAULT_HOST_EMAIL = process.env.HOST_EMAIL || 'admin@gmail.com';
const DEFAULT_HOST_PASSWORD = process.env.HOST_PASSWORD || 'admin123';

const hashToken = (token) => crypto.createHash('sha256').update(token).digest('hex');

const publicUser = (user) => ({
  _id: user._id,
  name: user.name,
  email: user.email,
  avatar: user.avatar,
  role: user.role,
  phone: user.phone,
  bio: user.bio,
  emailVerified: user.emailVerified,
  createdAt: user.createdAt,
});

/**
 * Generate signed JWT token
 */
const generateToken = (user) => {
  return jwt.sign(
    { id: user._id, email: user.email, role: user.role },
    JWT_SECRET,
    { expiresIn: '30d' }
  );
};

/**
 * @desc    Register a new user
 * @route   POST /api/auth/signup
 * @access  Public
 */
export const signup = asyncHandler(async (req, res, next) => {
  const { name, email, password, avatar, phone, bio } = req.body;

  // Validation
  if (!name || !email || !password) {
    return next(new AppError('Please provide full name, email, and password.', 400));
  }

  if (password.length < 6) {
    return next(new AppError('Password must be at least 6 characters long.', 400));
  }

  // Check if user exists
  const existingUser = await User.findOne({ email: email.toLowerCase().trim() });
  if (existingUser) {
    return next(new AppError('An account with this email address already exists. Please log in instead.', 400));
  }

  // Hash password
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  // Generate pleasant fallback avatar
  const defaultAvatar =
    avatar ||
    `https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80`;

  // Create user in MongoDB
  const user = await User.create({
    name: name.trim(),
    email: email.toLowerCase().trim(),
    password: hashedPassword,
    avatar: defaultAvatar,
    phone: phone || '',
    bio: bio || 'Passionate traveler exploring luxury resorts worldwide.',
  });

  const verificationToken = crypto.randomBytes(24).toString('hex');
  user.emailVerificationTokenHash = hashToken(verificationToken);
  user.emailVerificationExpires = Date.now() + 24 * 60 * 60 * 1000;
  await user.save();

  const token = generateToken(user);

  res.status(201).json({
    success: true,
    token,
    user: publicUser(user),
    verificationToken: process.env.NODE_ENV === 'production' ? undefined : verificationToken,
    message: 'Welcome to Airbnb! Account created successfully.',
  });
});

/**
 * @desc    Authenticate user & return token
 * @route   POST /api/auth/login
 * @access  Public
 */
export const login = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(new AppError('Please enter both email and password.', 400));
  }

  // Find user and include hashed password for verification
  let user = await User.findOne({ email: email.toLowerCase().trim() }).select('+password');
  if (!user && email.toLowerCase().trim() === DEFAULT_HOST_EMAIL && password === DEFAULT_HOST_PASSWORD) {
    const hashedPassword = await bcrypt.hash(DEFAULT_HOST_PASSWORD, 10);
    user = await User.create({
      name: 'Havenly Host Admin',
      email: DEFAULT_HOST_EMAIL,
      password: hashedPassword,
      role: 'host',
      bio: 'Host account for managing Havenly stays.',
      avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=200&q=80',
    });
  }
  if (!user) {
    return next(new AppError('Invalid email or password.', 401));
  }

  const isMatch = await user.matchPassword(password);
  if (!isMatch) {
    return next(new AppError('Invalid email or password.', 401));
  }

  const token = generateToken(user);

  res.status(200).json({
    success: true,
    token,
    user: publicUser(user),
    message: 'Logged in successfully! Welcome back.',
  });
});

/**
 * @desc    Get currently authenticated user
 * @route   GET /api/auth/me
 * @access  Private
 */
export const getMe = asyncHandler(async (req, res) => {
  res.status(200).json({
    success: true,
    user: req.user,
  });
});

/**
 * @desc    Demo 1-click traveler login for quick testing
 * @route   POST /api/auth/demo
 * @access  Public
 */
export const loginDemo = asyncHandler(async (req, res) => {
  const demoEmail = process.env.DEMO_EMAIL || 'traveler.demo@havenly.local';
  const demoPassword = process.env.DEMO_PASSWORD || 'HavenlyStay2026!';

  let user = await User.findOne({ email: demoEmail });
  if (!user) {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(demoPassword, salt);

    user = await User.create({
      name: 'Eleanor Vance',
      email: demoEmail,
      password: hashedPassword,
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
      role: 'guest',
      bio: 'Luxury architecture enthusiast and frequent world traveler.',
      phone: '+1 (555) 234-5678',
    });
  }

  const token = generateToken(user);

  res.status(200).json({
    success: true,
    token,
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
      avatar: user.avatar,
      role: user.role,
      phone: user.phone,
      bio: user.bio,
      createdAt: user.createdAt,
    },
    message: 'Logged in as Demo Traveler (Eleanor Vance).',
  });
});

/**
 * @desc    Update user profile data (name, avatar, bio, phone)
 * @route   PUT /api/auth/profile
 * @access  Private
 */
export const updateProfile = asyncHandler(async (req, res, next) => {
  const { name, avatar, bio, phone } = req.body;

  const updateFields = {};
  if (name !== undefined && name.trim()) updateFields.name = name.trim();
  if (avatar !== undefined && avatar) updateFields.avatar = avatar;
  if (bio !== undefined) updateFields.bio = bio;
  if (phone !== undefined) updateFields.phone = phone;

  const user = await User.findByIdAndUpdate(
    req.user._id,
    { $set: updateFields },
    { new: true, runValidators: true }
  ).select('-password');

  if (!user) {
    return next(new AppError('User not found', 404));
  }

  res.status(200).json({
    success: true,
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
      avatar: user.avatar,
      role: user.role,
      phone: user.phone,
      bio: user.bio,
      createdAt: user.createdAt,
    },
    message: 'Profile updated successfully in MongoDB!',
  });
});

export const forgotPassword = asyncHandler(async (req, res) => {
  const email = req.body.email?.toLowerCase().trim();
  const user = email ? await User.findOne({ email }) : null;
  let resetToken;
  if (user) {
    resetToken = crypto.randomBytes(24).toString('hex');
    user.passwordResetTokenHash = hashToken(resetToken);
    user.passwordResetExpires = Date.now() + 15 * 60 * 1000;
    await user.save();
  }
  const response = { success: true, message: 'If an account exists, reset instructions are ready.' };
  if (process.env.NODE_ENV !== 'production' && resetToken) response.resetToken = resetToken;
  res.json(response);
});

export const resetPassword = asyncHandler(async (req, res, next) => {
  const { token, password } = req.body;
  if (!token || !password || password.length < 6) return next(new AppError('A valid reset token and password of at least 6 characters are required.', 400));
  const user = await User.findOne({ passwordResetTokenHash: hashToken(token), passwordResetExpires: { $gt: Date.now() } }).select('+password');
  if (!user) return next(new AppError('This reset link is invalid or expired.', 400));
  user.password = await bcrypt.hash(password, 10);
  user.passwordResetTokenHash = undefined;
  user.passwordResetExpires = undefined;
  await user.save();
  res.json({ success: true, message: 'Password reset successfully. Please log in again.' });
});

export const changePassword = asyncHandler(async (req, res, next) => {
  const { currentPassword, newPassword } = req.body;
  if (!currentPassword || !newPassword || newPassword.length < 6) return next(new AppError('Current password and a new password of at least 6 characters are required.', 400));
  const user = await User.findById(req.user._id).select('+password');
  if (!user || !(await user.matchPassword(currentPassword))) return next(new AppError('Current password is incorrect.', 401));
  user.password = await bcrypt.hash(newPassword, 10);
  await user.save();
  res.json({ success: true, message: 'Password changed successfully. Other sessions should be signed in again.' });
});

export const verifyEmail = asyncHandler(async (req, res, next) => {
  const user = await User.findOne({ emailVerificationTokenHash: hashToken(req.params.token), emailVerificationExpires: { $gt: Date.now() } });
  if (!user) return next(new AppError('This verification link is invalid or expired.', 400));
  user.emailVerified = true;
  user.emailVerificationTokenHash = undefined;
  user.emailVerificationExpires = undefined;
  await user.save();
  res.json({ success: true, message: 'Email verified successfully.' });
});
