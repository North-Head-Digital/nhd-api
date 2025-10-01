const request = require('supertest');
const app = require('../test-server');

describe('Admin Routes', () => {
  let adminToken;
  let clientToken;
  let adminUser;
  let clientUser;

  beforeEach(async () => {
    // Create admin user
    adminUser = await global.testUtils.createTestAdmin();
    adminToken = await global.testUtils.getAuthToken(adminUser);

    // Create client user
    clientUser = await global.testUtils.createTestUser();
    clientToken = await global.testUtils.getAuthToken(clientUser);
  });

  describe('POST /api/admin/create-admin', () => {
    it('should create admin user successfully', async () => {
      const adminData = {
        name: 'New Admin',
        email: 'newadmin@example.com',
        password: 'adminpassword123',
        company: 'Admin Company'
      };

      const response = await request(app)
        .post('/api/admin/create-admin')
        .send(adminData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Admin user created successfully');
      expect(response.body.user.email).toBe(adminData.email);
      expect(response.body.user.role).toBe('admin');
    });

    it('should not create admin with existing email', async () => {
      const adminData = {
        name: 'Existing Admin',
        email: 'existing@example.com',
        password: 'adminpassword123',
        company: 'Admin Company'
      };

      // Create first admin with different email to avoid conflict with beforeEach
      await global.testUtils.createTestUser({ 
        email: adminData.email,
        role: 'admin' 
      });

      const response = await request(app)
        .post('/api/admin/create-admin')
        .send(adminData)
        .expect(409);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Admin user already exists with this email');
    });

    it('should validate required fields', async () => {
      const response = await request(app)
        .post('/api/admin/create-admin')
        .send({})
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('All fields are required');
    });
  });

  describe('POST /api/admin/reset-admin-password', () => {
    it('should reset admin password successfully', async () => {
      // Admin user already created in beforeEach
      const response = await request(app)
        .post('/api/admin/reset-admin-password')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Admin password reset successfully');
      expect(response.body.user.email).toBe('admin@test.com');
      expect(response.body.user.role).toBe('admin');
    });

    it('should handle case when admin user does not exist', async () => {
      // Delete admin user
      const User = require('../../models/User');
      await User.deleteOne({ email: 'admin@test.com' });

      const response = await request(app)
        .post('/api/admin/reset-admin-password')
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Admin user not found');
    });
  });

  describe('GET /api/admin/debug-admin', () => {
    it('should return admin user debug information', async () => {
      // Admin user already created in beforeEach
      const response = await request(app)
        .get('/api/admin/debug-admin')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.user.email).toBe('admin@test.com');
      expect(response.body.user.role).toBe('admin');
      expect(response.body.user.passwordTest).toBe(true);
    });

    it('should handle case when admin user does not exist', async () => {
      // Delete admin user
      const User = require('../../models/User');
      await User.deleteOne({ email: 'admin@test.com' });

      const response = await request(app)
        .get('/api/admin/debug-admin')
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Admin user not found');
    });
  });

  describe('POST /api/admin/fix-admin', () => {
    it('should recreate admin user successfully', async () => {
      const response = await request(app)
        .post('/api/admin/fix-admin')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Admin user recreated successfully');
      expect(response.body.user.email).toBe('admin@test.com');
      expect(response.body.user.role).toBe('admin');
    });

    it('should delete existing admin before recreating', async () => {
      // Admin user already created in beforeEach

      const response = await request(app)
        .post('/api/admin/fix-admin')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Admin user recreated successfully');

      // Verify only one admin exists
      const User = require('../../models/User');
      const adminCount = await User.countDocuments({ email: 'admin@test.com' });
      expect(adminCount).toBe(1);
    });
  });
});
