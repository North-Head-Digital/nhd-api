const express = require('express');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const router = express.Router();

// Create admin user endpoint (for setup purposes)
router.post('/create-admin', async (req, res) => {
  try {
    const { name, email, password, company } = req.body;
    
    // Validate required fields
    if (!name || !email || !password || !company) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required',
        type: 'VALIDATION_ERROR'
      });
    }
    
    // Check if admin already exists
    const existingAdmin = await User.findOne({ email });
    
    if (existingAdmin) {
      return res.status(409).json({
        success: false,
        message: 'Admin user already exists with this email',
        type: 'DUPLICATE_EMAIL'
      });
    }

    // Create admin user (password will be hashed by pre-save middleware)
    const adminUser = new User({
      name,
      email,
      password,
      company,
      role: 'admin'
    });

    await adminUser.save();

    res.status(201).json({
      success: true,
      message: 'Admin user created successfully',
      user: {
        id: adminUser._id,
        email: adminUser.email,
        role: adminUser.role,
        name: adminUser.name,
        company: adminUser.company
      }
    });

  } catch (error) {
    console.error('Error creating admin user:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating admin user',
      type: 'INTERNAL_ERROR',
      error: error.message
    });
  }
});

// Reset admin password endpoint
router.post('/reset-admin-password', async (req, res) => {
  try {
    // Find admin user (use test email in test environment)
    const adminEmail = process.env.NODE_ENV === 'test' ? 'admin@test.com' : 'admin@northheaddigital.com';
    const adminUser = await User.findOne({ email: adminEmail });
    
    if (!adminUser) {
      return res.status(404).json({
        success: false,
        message: 'Admin user not found'
      });
    }

    // Hash new password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash('password123', saltRounds);

    // Update password
    adminUser.password = hashedPassword;
    await adminUser.save();

    res.json({
      success: true,
      message: 'Admin password reset successfully',
      user: {
        email: adminUser.email,
        role: adminUser.role
      }
    });

  } catch (error) {
    console.error('Error resetting admin password:', error);
    res.status(500).json({
      success: false,
      message: 'Error resetting admin password',
      error: error.message
    });
  }
});

// Debug endpoint to check user data
router.get('/debug-admin', async (req, res) => {
  try {
    // Use test email in test environment
    const adminEmail = process.env.NODE_ENV === 'test' ? 'admin@test.com' : 'admin@northheaddigital.com';
    const adminUser = await User.findOne({ email: adminEmail }).select('+password');
    
    if (!adminUser) {
      return res.status(404).json({ 
        success: false, 
        message: 'Admin user not found',
        type: 'NOT_FOUND'
      });
    }

    // Test password comparison
    const passwordTest = await bcrypt.compare('password123', adminUser.password);

    res.json({
      success: true,
      user: {
        email: adminUser.email,
        role: adminUser.role,
        name: adminUser.name,
        company: adminUser.company,
        isActive: adminUser.isActive,
        passwordLength: adminUser.password.length,
        passwordStartsWith: adminUser.password.substring(0, 10),
        passwordTest: passwordTest
      }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      type: 'INTERNAL_ERROR',
      error: error.message
    });
  }
});

// Delete and recreate admin user with correct password
router.post('/fix-admin', async (req, res) => {
  try {
    // Use test email in test environment
    const adminEmail = process.env.NODE_ENV === 'test' ? 'admin@test.com' : 'admin@northheaddigital.com';
    
    // Delete existing admin user
    await User.deleteOne({ email: adminEmail });
    console.log('Deleted existing admin user');

    // Create new admin user using the User model (which will hash password correctly)
    const adminUser = new User({
      name: 'Admin User',
      email: adminEmail,
      password: 'password123', // This will be hashed by the pre-save middleware
      company: 'North Head Digital',
      role: 'admin'
    });

    await adminUser.save();
    console.log('Created new admin user');

    res.json({
      success: true,
      message: 'Admin user recreated successfully',
      user: {
        email: adminUser.email,
        role: adminUser.role,
        name: adminUser.name
      }
    });

  } catch (error) {
    console.error('Error fixing admin user:', error);
    res.status(500).json({
      success: false,
      message: 'Error fixing admin user',
      type: 'INTERNAL_ERROR',
      error: error.message
    });
  }
});

module.exports = router;
