import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import { AppError, asyncHandler } from '../middleware/errorHandler.js';

const JWT_SECRET = process.env.JWT_SECRET || 'airbnb_super_secret_jwt_key_2026';

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

  const token = generateToken(user);

  res.status(201).json({
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
  const user = await User.findOne({ email: email.toLowerCase().trim() }).select('+password');
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
  const demoEmail = 'guest@airbnb.luxury';

  let user = await User.findOne({ email: demoEmail });
  if (!user) {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('Traveler2026!', salt);

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
