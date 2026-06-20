const request = require('supertest');
const express = require('express');

const app = express();
app.use(express.json());

// Mock Prisma
jest.mock('../utils/prisma', () => ({
  user: {
    findUnique: jest.fn(),
    findFirst: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
  }
}));

// Mock bcrypt and jwt to avoid heavy cryptographic operations in tests
jest.mock('bcryptjs', () => ({
  genSalt: jest.fn().mockResolvedValue('salt'),
  hash: jest.fn().mockResolvedValue('hashed_password'),
  compare: jest.fn(),
}));

jest.mock('jsonwebtoken', () => ({
  sign: jest.fn().mockReturnValue('fake_jwt_token'),
}));

// Mock email utility so it doesn't actually email people
jest.mock('../utils/sendEmail', () => jest.fn().mockResolvedValue(true));

// Mock express-validator to simulate empty errors
jest.mock('express-validator', () => ({
  validationResult: jest.fn(() => ({
    isEmpty: () => true,
    array: () => []
  }))
}));

const prisma = require('../utils/prisma');
const bcrypt = require('bcryptjs');
const authController = require('../controllers/authController');

const mockAuth = (req, res, next) => { req.user = { id: 1 }; next(); };

app.post('/api/auth/register', authController.register);
app.post('/api/auth/login', authController.login);
app.post('/api/auth/forgotpassword', authController.forgotPassword);
app.put('/api/auth/resetPassword/:resettoken', authController.resetPassword);
app.put('/api/auth/changePassword', mockAuth, authController.changePassword);
app.put('/api/auth/profileUpdate', mockAuth, authController.updateProfile);
app.put('/api/auth/push-token', mockAuth, authController.savePushToken);

describe('Auth Controller Tests', () => {
  afterEach(() => jest.clearAllMocks());

  describe('POST /api/auth/register', () => {
    it('should return 400 if user already exists', async () => {
      prisma.user.findUnique.mockResolvedValue({ email: 'test@test.com' });

      const response = await request(app)
        .post('/api/auth/register')
        .send({ name: 'Test', email: 'test@test.com', password: 'password123' });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('User already exists');
    });

    it('should return 400 if there are validation errors (e.g., weak password)', async () => {
      // 1. Temporarily override the mock to simulate a validation error
      const { validationResult } = require('express-validator');
      validationResult.mockReturnValueOnce({
        isEmpty: () => false,
        array: () => [{ msg: 'Password must be 8+ characters, with at least 1 uppercase and 1 number', param: 'password' }]
      });

      // 2. Make the request
      const response = await request(app)
        .post('/api/auth/register')
        .send({ name: 'Test', email: 'test@test.com', password: 'weak' });

      // 3. Assertions
      expect(response.status).toBe(400);
      expect(response.body.errors).toBeDefined();
      expect(response.body.errors[0].msg).toBe('Password must be 8+ characters, with at least 1 uppercase and 1 number');
    });

    it('should hash password and create user', async () => {
      prisma.user.findUnique.mockResolvedValue(null);
      prisma.user.create.mockResolvedValue({
        id: 1, name: 'Test', email: 'test@test.com', role: 'CITIZEN'
      });

      const response = await request(app)
        .post('/api/auth/register')
        .send({ name: 'Test', email: 'test@test.com', password: 'password123' });

      expect(response.status).toBe(201);
      expect(response.body.token).toBe('fake_jwt_token');
      expect(bcrypt.hash).toHaveBeenCalledWith('password123', 'salt');
    });
  });

  describe('POST /api/auth/login', () => {
    it('should return 400 for invalid credentials (wrong password)', async () => {
      prisma.user.findUnique.mockResolvedValue({ id: 1, password: 'hashed_password' });
      bcrypt.compare.mockResolvedValue(false); // Simulate bad password

      const response = await request(app)
        .post('/api/auth/login')
        .send({ email: 'test@test.com', password: 'wrongpassword' });

      expect(response.status).toBe(400);
      
    });

    it('should return a token if credentials are valid', async () => {
      prisma.user.findUnique.mockResolvedValue({ id: 1, email: 'test@test.com', password: 'hashed_password' });
      bcrypt.compare.mockResolvedValue(true); 

      const response = await request(app)
        .post('/api/auth/login')
        .send({ email: 'test@test.com', password: 'correctpassword' });

      expect(response.status).toBe(200);
      expect(response.body.token).toBe('fake_jwt_token');
    });
  });

  describe('POST /api/auth/forgotpassword', () => {
    it('should return 404 if email is not found', async () => {
      prisma.user.findUnique.mockResolvedValue(null);

      const response = await request(app)
        .post('/api/auth/forgotpassword')
        .send({ email: 'nobody@test.com' });

      expect(response.status).toBe(404);
      expect(response.body.message).toBe('There is no user with that email');
    });
  });

  describe('PUT /api/auth/resetPassword/:resettoken', () => {
    it('should return 400 if token is invalid or expired', async () => {
      prisma.user.findFirst.mockResolvedValue(null);

      const response = await request(app)
        .put('/api/auth/resetPassword/badtoken')
        .send({ password: 'NewPass123' });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Invalid token or expired token');
    });

    it('should reset password and return 200 on valid token', async () => {
      prisma.user.findFirst.mockResolvedValue({ id: 1 });
      prisma.user.update.mockResolvedValue({ id: 1 });

      const response = await request(app)
        .put('/api/auth/resetPassword/validtoken')
        .send({ password: 'NewPass123' });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toBe('Password updated successfully');
      expect(prisma.user.update).toHaveBeenCalled();
    });
  });

  describe('PUT /api/auth/changePassword', () => {
    it('should return 400 if current password is wrong', async () => {
      prisma.user.findUnique.mockResolvedValue({ id: 1, password: 'hashed_password' });
      bcrypt.compare.mockResolvedValue(false);

      const response = await request(app)
        .put('/api/auth/changePassword')
        .send({ currentPassword: 'wrong', newPassword: 'NewPass123' });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Current password is incorrect.');
    });

    it('should return 200 on successful password change', async () => {
      prisma.user.findUnique.mockResolvedValue({ id: 1, password: 'hashed_password' });
      bcrypt.compare.mockResolvedValue(true);
      prisma.user.update.mockResolvedValue({ id: 1 });

      const response = await request(app)
        .put('/api/auth/changePassword')
        .send({ currentPassword: 'OldPass123', newPassword: 'NewPass456' });

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Password changed successfully.');
    });
  });

  describe('PUT /api/auth/profileUpdate', () => {
    it('should return 200 with updated user on successful name update', async () => {
      const updatedUser = { id: 1, name: 'New Name', email: 'test@test.com', role: 'CITIZEN', createdAt: new Date().toISOString() };
      prisma.user.update.mockResolvedValue(updatedUser);

      const response = await request(app)
        .put('/api/auth/profileUpdate')
        .send({ name: 'New Name' });

      expect(response.status).toBe(200);
      expect(response.body.name).toBe('New Name');
      expect(prisma.user.update).toHaveBeenCalledWith(expect.objectContaining({
        where: { id: 1 },
        data: { name: 'New Name' },
      }));
    });
  });

  describe('PUT /api/auth/push-token', () => {
    it('should return 400 if push token is missing', async () => {
      const response = await request(app)
        .put('/api/auth/push-token')
        .send({});

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Push token is required');
    });

    it('should return 200 on successful push token save', async () => {
      prisma.user.update.mockResolvedValue({ id: 1 });

      const response = await request(app)
        .put('/api/auth/push-token')
        .send({ pushToken: 'ExponentPushToken[xxx]' });

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Push token saved');
      expect(prisma.user.update).toHaveBeenCalledWith(expect.objectContaining({
        where: { id: 1 },
        data: { pushToken: 'ExponentPushToken[xxx]' },
      }));
    });
  });
});