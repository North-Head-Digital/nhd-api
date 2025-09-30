// This script will create an admin user using Railway's production database
// Run this by going to Railway dashboard → Deployments → View Logs → Run Command

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Use Railway's environment variable
const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('❌ MONGODB_URI environment variable not found');
  process.exit(1);
}

// Define User schema inline since we can't import the model
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  company: { type: String, required: true },
  role: { type: String, enum: ['admin', 'client'], default: 'client' },
  lastLogin: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);

async function createAdmin() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: 'admin@northheaddigital.com' });
    
    if (existingAdmin) {
      console.log('👤 Admin user already exists');
      console.log('📧 Email:', existingAdmin.email);
      console.log('🔑 Role:', existingAdmin.role);
    } else {
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
      console.log('✅ Admin user created successfully!');
      console.log('📧 Email: admin@northheaddigital.com');
      console.log('🔑 Password: password123');
      console.log('👤 Role: admin');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

createAdmin();
