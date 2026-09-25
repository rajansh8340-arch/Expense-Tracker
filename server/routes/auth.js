import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User, Transaction } from '../models/models.js';
import { protect } from '../middleware/auth.js';
import { seedTransactionsForUser } from '../utils/seedData.js';

const router = express.Router();

const tokenFor = (user) => {
  const secret = process.env.JWT_SECRET || 'super_secret_ledgerly_jwt_key_2026_dev';
  return jwt.sign({ id: user._id }, secret, { expiresIn: '7d' });
};

// @route   POST /api/auth/register
// @desc    Register a new user
router.post('/register', async (req, res) => {
  const { name, email, password, currency } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ message: 'Name, email, and password are required.' });
  }

  if (password.length < 6) {
    return res.status(400).json({ message: 'Password must be at least 6 characters long.' });
  }

  const existing = await User.findOne({ email: email.toLowerCase().trim() });
  if (existing) {
    return res.status(409).json({ message: 'An account with that email already exists.' });
  }

  const hashedPassword = await bcrypt.hash(password, 12);
  const user = await User.create({
    name: name.trim(),
    email: email.toLowerCase().trim(),
    password: hashedPassword,
    currency: currency || 'USD',
  });

  res.status(201).json({
    token: tokenFor(user),
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      currency: user.currency,
      monthlyBudget: user.monthlyBudget,
    },
  });
});

// @route   POST /api/auth/login
// @desc    Authenticate user & get token
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Please provide both email and password.' });
  }

  const user = await User.findOne({ email: email.toLowerCase().trim() });
  if (!user) {
    return res.status(401).json({ message: 'Invalid email or password.' });
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    return res.status(401).json({ message: 'Invalid email or password.' });
  }

  res.json({
    token: tokenFor(user),
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      currency: user.currency,
      monthlyBudget: user.monthlyBudget,
    },
  });
});

// @route   POST /api/auth/demo
// @desc    Log in as a pre-configured demo user with rich transactions
router.post('/demo', async (req, res) => {
  const demoEmail = 'demo@ledgerly.app';
  let user = await User.findOne({ email: demoEmail });

  if (!user) {
    const hashedPassword = await bcrypt.hash('LedgerlyDemo123!', 12);
    user = await User.create({
      name: 'Alex Morgan',
      email: demoEmail,
      password: hashedPassword,
      currency: 'USD',
      monthlyBudget: 2800,
    });
    await seedTransactionsForUser(user._id);
  } else {
    // If demo user exists but has 0 transactions, seed
    const count = await Transaction.countDocuments({ user: user._id });
    if (count === 0) {
      await seedTransactionsForUser(user._id);
    }
  }

  res.json({
    token: tokenFor(user),
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      currency: user.currency,
      monthlyBudget: user.monthlyBudget,
    },
  });
});

// @route   GET /api/auth/me
// @desc    Get currently logged in user profile
router.get('/me', protect, async (req, res) => {
  const user = await User.findById(req.user.id).select('-password');
  if (!user) {
    return res.status(404).json({ message: 'User not found.' });
  }
  res.json({ user });
});

// @route   PATCH /api/auth/me
// @desc    Update user profile & preferences
router.patch('/me', protect, async (req, res) => {
  const { name, currency, monthlyBudget, newPassword } = req.body;
  const updates = {};

  if (name && name.trim()) updates.name = name.trim();
  if (currency) updates.currency = currency;
  if (monthlyBudget !== undefined) updates.monthlyBudget = Number(monthlyBudget);

  if (newPassword && newPassword.length >= 6) {
    updates.password = await bcrypt.hash(newPassword, 12);
  }

  const user = await User.findByIdAndUpdate(req.user.id, updates, {
    new: true,
    runValidators: true,
  }).select('-password');

  if (!user) {
    return res.status(404).json({ message: 'User not found.' });
  }

  res.json({ user });
});

export default router;
