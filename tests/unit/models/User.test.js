const User = require('../../../models/User');
const bcrypt = require('bcryptjs');

describe('User Model', () => {
  describe('User Creation', () => {
    it('should create a user with valid data', async () => {
      const userData = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123',
        company: 'Test Company'
      };

      const user = await User.create(userData);

      expect(user).toBeDefined();
      expect(user.name).toBe(userData.name);
      expect(user.email).toBe(userData.email);
      expect(user.company).toBe(userData.company);
      expect(user.role).toBe('client'); // Default role
      expect(user.isActive).toBe(true); // Default value
      expect(user.password).not.toBe(userData.password); // Should be hashed
    });

    it('should hash password before saving', async () => {
      const plainPassword = 'password123';
      const user = await global.testUtils.createTestUser({ password: plainPassword });

      const isPasswordHashed = await bcrypt.compare(plainPassword, user.password);
      expect(isPasswordHashed).toBe(true);
    });

    it('should not hash password if not modified', async () => {
      const user = await global.testUtils.createTestUser();
      const originalPassword = user.password;

      user.name = 'Updated Name';
      await user.save();

      expect(user.password).toBe(originalPassword);
    });
  });

  describe('User Validation', () => {
    it('should require name', async () => {
      const userData = {
        email: 'test@example.com',
        password: 'password123',
        company: 'Test Company'
      };

      await expect(User.create(userData)).rejects.toThrow(/Name is required/);
    });

    it('should require email', async () => {
      const userData = {
        name: 'Test User',
        password: 'password123',
        company: 'Test Company'
      };

      await expect(User.create(userData)).rejects.toThrow(/Email is required/);
    });

    it('should require valid email format', async () => {
      const userData = {
        name: 'Test User',
        email: 'invalid-email',
        password: 'password123',
        company: 'Test Company'
      };

      await expect(User.create(userData)).rejects.toThrow(/valid email/);
    });

    it('should require password', async () => {
      const userData = {
        name: 'Test User',
        email: 'test@example.com',
        company: 'Test Company'
      };

      await expect(User.create(userData)).rejects.toThrow(/Password is required/);
    });

    it('should require minimum password length', async () => {
      const userData = {
        name: 'Test User',
        email: 'test@example.com',
        password: '123',
        company: 'Test Company'
      };

      await expect(User.create(userData)).rejects.toThrow(/at least 6 characters/);
    });

    it('should require company', async () => {
      const userData = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123'
      };

      await expect(User.create(userData)).rejects.toThrow(/Company is required/);
    });

    it('should enforce unique email', async () => {
      const userData = {
        name: 'Test User',
        email: 'duplicate@example.com',
        password: 'password123',
        company: 'Test Company'
      };

      await User.create(userData);
      await expect(User.create(userData)).rejects.toThrow(/duplicate key error/);
    });

    it('should validate role enum', async () => {
      const userData = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
        company: 'Test Company',
        role: 'invalid-role'
      };

      await expect(User.create(userData)).rejects.toThrow(/is not a valid enum value/);
    });
  });

  describe('User Methods', () => {
    it('should compare password correctly', async () => {
      const plainPassword = 'password123';
      const user = await global.testUtils.createTestUser({ password: plainPassword });

      const isValid = await user.comparePassword(plainPassword);
      const isInvalid = await user.comparePassword('wrongpassword');

      expect(isValid).toBe(true);
      expect(isInvalid).toBe(false);
    });

    it('should exclude password from JSON output', async () => {
      const user = await global.testUtils.createTestUser();
      const userJson = user.toJSON();

      expect(userJson.password).toBeUndefined();
      expect(userJson.name).toBe(user.name);
      expect(userJson.email).toBe(user.email);
    });
  });

  describe('User Defaults', () => {
    it('should set default role to client', async () => {
      const user = await global.testUtils.createTestUser();
      expect(user.role).toBe('client');
    });

    it('should set default isActive to true', async () => {
      const user = await global.testUtils.createTestUser();
      expect(user.isActive).toBe(true);
    });

    it('should set default avatar to null', async () => {
      const user = await global.testUtils.createTestUser();
      expect(user.avatar).toBeNull();
    });

    it('should set default lastLogin to null', async () => {
      const user = await global.testUtils.createTestUser();
      expect(user.lastLogin).toBeNull();
    });
  });
});
