const request = require('supertest');
const { app } = require('../server'); 
const { User } = require('../models/UserModel');

// Mock the User model
jest.mock('../models/UserModel.js', () => ({
  User: {
    create: jest.fn()
  }
}));

describe('User Creation Endpoint', () => {
  it('should create a new user and return user data', async () => {
    // Mock data
    const userData = { username: 'newuser', email: 'newuser@example.com', password: 'password123' };
    const expectedResponse = { _id: '1', username: 'newuser', email: 'newuser@example.com' };

    // Mock implementation of User.create
    User.create.mockResolvedValue(expectedResponse);

    // Make a POST request to the user creation endpoint
    const response = await request(app)
      .post('/users')
      .send(userData);

    // Assertions
    expect(response.status).toBe(201);
    expect(response.body).toEqual(expectedResponse);
    expect(User.create).toHaveBeenCalledWith(userData);
  });
});