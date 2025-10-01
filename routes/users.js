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

    res.json({ 
      success: true,
      users 
    });

  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ 
      error: 'Failed to get users',
      message: error.message 
    });
  }
});

// Get current user profile
router.get('/profile', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('-password');
    if (!user) {
      return res.status(404).json({ 
        success: false,
        error: 'User not found' 
      });
    }

    res.json({
      success: true,
      user
    });

  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to get profile',
      message: error.message 
    });
  }
});

// Update current user profile
router.put('/profile', auth, async (req, res) => {
  try {
    const { name, company, avatar } = req.body;
    const currentUser = await User.findById(req.user.userId);

    const updateData = {};
    if (name) updateData.name = name;
    if (company) updateData.company = company;
    if (avatar !== undefined) updateData.avatar = avatar;

    // Prevent email and role updates through profile endpoint
    if (req.body.email) {
      return res.status(400).json({
        success: false,
        error: 'Email cannot be updated through this endpoint'
      });
    }
    
    if (req.body.role) {
      return res.status(400).json({
        success: false,
        error: 'Role cannot be updated through this endpoint'
      });
    }

    const user = await User.findByIdAndUpdate(
      req.user.userId, 
      updateData, 
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ 
        success: false,
        error: 'User not found' 
      });
    }

    res.json({
      success: true,
      message: 'Profile updated successfully',
      user
    });

  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to update profile',
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

    res.json({ 
      success: true,
      user 
    });

  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ 
      error: 'Failed to get user',
      message: error.message 
    });
  }
});

// Update user profile (admin only)
router.put('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, company, avatar, role } = req.body;
    const currentUser = await User.findById(req.user.userId);

    // Only admins can update other users
    if (currentUser.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied. Admin role required.' });
    }

    const updateData = {};
    if (name) updateData.name = name;
    if (company) updateData.company = company;
    if (avatar !== undefined) updateData.avatar = avatar;
    if (role) updateData.role = role;

    const user = await User.findByIdAndUpdate(
      id, 
      updateData, 
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      success: true,
      message: 'User updated successfully',
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

// Delete user (admin only)
router.delete('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const currentUser = await User.findById(req.user.userId);

    if (currentUser.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied. Admin role required.' });
    }

    const user = await User.findByIdAndDelete(id).select('-password');

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      success: true,
      message: 'User deleted successfully',
      user
    });

  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ 
      error: 'Failed to delete user',
      message: error.message 
    });
  }
});

module.exports = router;
