const request = require('supertest');
const app = require('../test-server');

describe('User Routes', () => {
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

  describe('GET /api/users', () => {
    it('should get all users for admin', async () => {
      const response = await request(app)
        .get('/api/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.users).toBeDefined();
      expect(Array.isArray(response.body.users)).toBe(true);
      expect(response.body.users.length).toBeGreaterThan(0);
      
      // Check that passwords are not included
      response.body.users.forEach(user => {
        expect(user.password).toBeUndefined();
      });
    });

    it('should return 403 for non-admin users', async () => {
      const response = await request(app)
        .get('/api/users')
        .set('Authorization', `Bearer ${clientToken}`)
        .expect(403);

      expect(response.body.error).toBe('Access denied. Admin role required.');
    });

    it('should return 401 without token', async () => {
      const response = await request(app)
        .get('/api/users')
        .expect(401);

      expect(response.body.error).toBe('No token provided');
    });
  });

  describe('GET /api/users/profile', () => {
    it('should get user profile with valid token', async () => {
      const response = await request(app)
        .get('/api/users/profile')
        .set('Authorization', `Bearer ${clientToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.user).toBeDefined();
      expect(response.body.user.email).toBe(clientUser.email);
      expect(response.body.user.password).toBeUndefined();
    });

    it('should return 401 without token', async () => {
      const response = await request(app)
        .get('/api/users/profile')
        .expect(401);

      expect(response.body.error).toBe('No token provided');
    });

    it('should return 401 with invalid token', async () => {
      const response = await request(app)
        .get('/api/users/profile')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);

      expect(response.body.error).toBe('Invalid token');
    });
  });

  describe('PUT /api/users/profile', () => {
    it('should update user profile successfully', async () => {
      const updateData = {
        name: 'Updated Name',
        company: 'Updated Company'
      };

      const response = await request(app)
        .put('/api/users/profile')
        .set('Authorization', `Bearer ${clientToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Profile updated successfully');
      expect(response.body.user.name).toBe(updateData.name);
      expect(response.body.user.company).toBe(updateData.company);
    });

    it('should not allow updating email', async () => {
      const updateData = {
        email: 'newemail@example.com'
      };

      const response = await request(app)
        .put('/api/users/profile')
        .set('Authorization', `Bearer ${clientToken}`)
        .send(updateData)
        .expect(200);

      // Email should remain unchanged
      expect(response.body.user.email).toBe(clientUser.email);
    });

    it('should not allow updating role', async () => {
      const updateData = {
        role: 'admin'
      };

      const response = await request(app)
        .put('/api/users/profile')
        .set('Authorization', `Bearer ${clientToken}`)
        .send(updateData)
        .expect(200);

      // Role should remain unchanged
      expect(response.body.user.role).toBe('client');
    });

    it('should return 401 without token', async () => {
      const updateData = {
        name: 'Updated Name'
      };

      const response = await request(app)
        .put('/api/users/profile')
        .send(updateData)
        .expect(401);

      expect(response.body.error).toBe('No token provided');
    });
  });

  describe('PUT /api/users/:id', () => {
    it('should update user by admin', async () => {
      const updateData = {
        name: 'Admin Updated Name',
        role: 'admin'
      };

      const response = await request(app)
        .put(`/api/users/${clientUser._id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('User updated successfully');
      expect(response.body.user.name).toBe(updateData.name);
      expect(response.body.user.role).toBe(updateData.role);
    });

    it('should return 403 for non-admin users', async () => {
      const updateData = {
        name: 'Unauthorized Update'
      };

      const response = await request(app)
        .put(`/api/users/${clientUser._id}`)
        .set('Authorization', `Bearer ${clientToken}`)
        .send(updateData)
        .expect(403);

      expect(response.body.error).toBe('Access denied. Admin role required.');
    });

    it('should return 404 for non-existent user', async () => {
      const updateData = {
        name: 'Updated Name'
      };
      const fakeId = '507f1f77bcf86cd799439011'; // Valid ObjectId format

      const response = await request(app)
        .put(`/api/users/${fakeId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(updateData)
        .expect(404);

      expect(response.body.error).toBe('User not found');
    });
  });

  describe('DELETE /api/users/:id', () => {
    it('should delete user by admin', async () => {
      const response = await request(app)
        .delete(`/api/users/${clientUser._id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('User deleted successfully');

      // Verify user is deleted
      const User = require('../../models/User');
      const deletedUser = await User.findById(clientUser._id);
      expect(deletedUser).toBeNull();
    });

    it('should return 403 for non-admin users', async () => {
      const response = await request(app)
        .delete(`/api/users/${clientUser._id}`)
        .set('Authorization', `Bearer ${clientToken}`)
        .expect(403);

      expect(response.body.error).toBe('Access denied. Admin role required.');
    });

    it('should return 404 for non-existent user', async () => {
      const fakeId = '507f1f77bcf86cd799439011'; // Valid ObjectId format

      const response = await request(app)
        .delete(`/api/users/${fakeId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(404);

      expect(response.body.error).toBe('User not found');
    });
  });
});
