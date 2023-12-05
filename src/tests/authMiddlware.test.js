const jwt = require('jsonwebtoken');
const { User } = require('../models/UserModel');
const authMiddleware = require('../functions/authMiddleware');

// Mock the dependencies
jest.mock('jsonwebtoken');
jest.mock('../models/UserModel');

describe('authMiddleware', () => {
  // Mocked user object
  const mockUser = {
    _id: '123',
    username: 'Usertest',
  };


  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should authenticate a valid user', async () => {
    // Mock jwt.verify to simulate a valid token
    jwt.verify.mockImplementation(() => ({ userID: mockUser._id }));

    // Mock User.findOne to return the mock user
    User.findOne.mockResolvedValue(mockUser);

    // Mock Express req, res, next objects
    const req = {
      header: jest.fn().mockReturnValue('Bearer validtoken'),
    };
    const res = {};
    const next = jest.fn();

    // Call the middleware
    await authMiddleware(req, res, next);

    // Assertions
    expect(jwt.verify).toHaveBeenCalledWith('validtoken', process.env.JWT_KEY);
    expect(User.findOne).toHaveBeenCalledWith({ _id: mockUser._id });
    expect(req.user).toEqual(mockUser);
    expect(next).toHaveBeenCalled();
  });

  it('should return an error for invalid token', async () => {
    // Mock jwt.verify to throw an error
    jwt.verify.mockImplementation(() => {
      throw new Error('invalid token');
    });

    // Mock Express req, res, next objects
    const req = {
      header: jest.fn().mockReturnValue('Bearer invalidtoken'),
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
    };
    const next = jest.fn();

    // Call the middleware
    await authMiddleware(req, res, next);

    // Assertions
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.send).toHaveBeenCalledWith({ error: 'Please authenticate.' });
  });
});