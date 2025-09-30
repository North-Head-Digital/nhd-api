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
    const adminUser = await User.findOne({ email: 'admin@northheaddigital.com' }).select('+password');
    
    if (!adminUser) {
      return res.json({ success: false, message: 'Admin user not found' });
    }

    // Test password comparison
    const bcrypt = require('bcryptjs');
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
      error: error.message
    });
  }
});

// Delete and recreate admin user with correct password
router.post('/fix-admin', async (req, res) => {
  try {
    // Delete existing admin user
    await User.deleteOne({ email: 'admin@northheaddigital.com' });
    console.log('Deleted existing admin user');

    // Create new admin user using the User model (which will hash password correctly)
    const adminUser = new User({
      name: 'Admin User',
      email: 'admin@northheaddigital.com',
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
      error: error.message
    });
  }
});

module.exports = router;
