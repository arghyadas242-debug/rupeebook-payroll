import express from 'express';
import crypto from 'crypto';
import User from '../models/User.js';

const router = express.Router();

// @desc    Register a new corporate treasury user
// @route   POST /api/v1/auth/register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role, entity } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email, and password are required fields.' });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return res.status(409).json({ message: 'Corporate email is already registered.' });
    }

    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password: password.trim(),
      role: role || 'CFO / Treasury Admin',
      entity: entity || 'Global Treasury Corp (IN-01)',
    });

    const token = crypto.randomBytes(24).toString('hex');

    res.status(201).json({
      success: true,
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        entity: user.entity,
      },
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Internal server error during account provisioning.' });
  }
});

// @desc    Authenticate corporate user & return session token
// @route   POST /api/v1/auth/login
router.post('/login', async (req, res) => {
  try {
    // If no users exist, seed the default CFO credentials
    const userCount = await User.countDocuments();
    if (userCount === 0) {
      await User.create({
        name: 'Arghya Das (CFO)',
        email: 'cfo@rupeebook.in',
        password: 'admin123',
        role: 'CFO / Treasury Admin',
        entity: 'Global Treasury Corp (IN-01)',
      });
    }

    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required.' });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: normalizedEmail });

    if (!user || user.password !== password) {
      return res.status(401).json({ message: 'Invalid corporate email or password.' });
    }

    const token = crypto.randomBytes(24).toString('hex');

    res.status(200).json({
      success: true,
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        entity: user.entity,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Internal server error during authentication.' });
  }
});

// @desc    Get current user profile from token verification
// @route   GET /api/v1/auth/me
router.get('/me', async (req, res) => {
  try {
    const user = await User.findOne({ email: 'cfo@rupeebook.in' }).select('-password');
    res.status(200).json({ success: true, user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
