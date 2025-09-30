const express = require('express');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const router = express.Router();

// Create admin user endpoint (for setup purposes)
router.post('/create-admin', async (req, res) => {
  try {
    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: 'admin@northheaddigital.com' });
    
    if (existingAdmin) {
      return res.json({
        success: true,
        message: 'Admin user already exists',
        user: {
          email: existingAdmin.email,
          role: existingAdmin.role
        }
      });
    }

    // Hash password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash('password123', saltRounds);

    // Create admin user
    const adminUser = new User({
      name: 'Admin User',
      email: 'admin@northheaddigital.com',
      password: hashedPassword,
      company: 'North Head Digital',
      role: 'admin'
    });

    await adminUser.save();

    res.json({
      success: true,
      message: 'Admin user created successfully',
      user: {
        email: adminUser.email,
        role: adminUser.role
      }
    });

  } catch (error) {
    console.error('Error creating admin user:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating admin user',
      error: error.message
    });
  }
});

// Reset admin password endpoint
router.post('/reset-admin-password', async (req, res) => {
  try {
    // Find admin user
    const adminUser = await User.findOne({ email: 'admin@northheaddigital.com' });
    
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
    const adminUser = await User.findOne({ email: 'admin@northheaddigital.com' });
    
    if (!adminUser) {
      return res.json({ success: false, message: 'Admin user not found' });
    }

    res.json({
      success: true,
      user: {
        email: adminUser.email,
        role: adminUser.role,
        name: adminUser.name,
        company: adminUser.company,
        passwordLength: adminUser.password.length,
        passwordStartsWith: adminUser.password.substring(0, 10)
      }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;
