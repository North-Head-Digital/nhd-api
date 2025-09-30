const express = require('express');
const User = require('../models/User');
const auth = require('../middleware/auth');

const router = express.Router();

// Get all users (admin only)
router.get('/', auth, async (req, res) => {
  try {
    // Check if user is admin
    const currentUser = await User.findById(req.user.userId);
    if (currentUser.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied. Admin role required.' });
    }

    const users = await User.find({ isActive: true })
      .select('-password')
      .sort({ createdAt: -1 });

    res.json({ users });

  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ 
      error: 'Failed to get users',
      message: error.message 
    });
  }
});

// Get user by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const currentUser = await User.findById(req.user.userId);

    // Users can only view their own profile unless they're admin
    if (currentUser.role !== 'admin' && currentUser._id.toString() !== id) {
      return res.status(403).json({ error: 'Access denied.' });
    }

    const user = await User.findById(id).select('-password');
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ user });

  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ 
      error: 'Failed to get user',
      message: error.message 
    });
  }
});

// Update user profile
router.put('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, company, avatar } = req.body;
    const currentUser = await User.findById(req.user.userId);

    // Users can only update their own profile unless they're admin
    if (currentUser.role !== 'admin' && currentUser._id.toString() !== id) {
      return res.status(403).json({ error: 'Access denied.' });
    }

    const updateData = {};
    if (name) updateData.name = name;
    if (company) updateData.company = company;
    if (avatar !== undefined) updateData.avatar = avatar;

    const user = await User.findByIdAndUpdate(
      id, 
      updateData, 
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      message: 'Profile updated successfully',
      user
    });

  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ 
      error: 'Failed to update user',
      message: error.message 
    });
  }
});

// Deactivate user (admin only)
router.delete('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const currentUser = await User.findById(req.user.userId);

    if (currentUser.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied. Admin role required.' });
    }

    const user = await User.findByIdAndUpdate(
      id, 
      { isActive: false }, 
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      message: 'User deactivated successfully',
      user
    });

  } catch (error) {
    console.error('Deactivate user error:', error);
    res.status(500).json({ 
      error: 'Failed to deactivate user',
      message: error.message 
    });
  }
});

module.exports = router;
