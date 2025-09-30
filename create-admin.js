const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://ADMIN:Password123@nhd-portal.6o9g1b7.mongodb.net/nhd-portal?retryWrites=true&w=majority';

async function createAdmin() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: 'admin@northheaddigital.com' });
    
    if (existingAdmin) {
      console.log('👤 Admin user already exists:', existingAdmin.email);
      console.log('📧 Email:', existingAdmin.email);
      console.log('🔑 Role:', existingAdmin.role);
      return;
    }

    // Create admin user
    const adminUser = new User({
      name: 'Admin User',
      email: 'admin@northheaddigital.com',
      password: 'password123',
      company: 'North Head Digital',
      role: 'admin'
    });

    await adminUser.save();
    console.log('✅ Admin user created successfully!');
    console.log('📧 Email: admin@northheaddigital.com');
    console.log('🔑 Password: password123');
    console.log('👤 Role: admin');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

createAdmin();
