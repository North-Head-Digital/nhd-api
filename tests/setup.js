const { MongoMemoryServer } = require('mongodb-memory-server');
const mongoose = require('mongoose');
const path = require('path');

// Load test environment variables
require('dotenv').config({ path: path.join(__dirname, 'config', 'test.env') });

let mongoServer;

// Setup in-memory MongoDB for testing
beforeAll(async () => {
  // Disconnect any existing connections first
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }
  
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  
  await mongoose.connect(mongoUri);
});

// Clean up after each test
afterEach(async () => {
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    const collection = collections[key];
    await collection.deleteMany({});
  }
});

// Cleanup after all tests
afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

// Global test utilities
global.testUtils = {
  // Helper to create a test user
  createTestUser: async (overrides = {}) => {
    const User = require('../models/User');
    const defaultUser = {
      name: 'Test User',
      email: 'test@example.com',
      password: 'password123',
      company: 'Test Company',
      role: 'client',
      ...overrides
    };
    return await User.create(defaultUser);
  },

  // Helper to create an admin user
  createTestAdmin: async () => {
    return await global.testUtils.createTestUser({
      email: 'admin@test.com',
      role: 'admin'
    });
  },

  // Helper to get auth token
  getAuthToken: async (user) => {
    const jwt = require('jsonwebtoken');
    return jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET || 'test-secret',
      { expiresIn: '1h' }
    );
  }
};
