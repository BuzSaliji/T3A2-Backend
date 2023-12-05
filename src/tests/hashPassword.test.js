// Import dependencies
const bcrypt = require('bcryptjs');
const { hashPassword } = require('../functions/userAuthFunctions');

// Mock bcrypt.genSalt and bcrypt.hash
jest.mock('bcryptjs', () => ({
  genSalt: jest.fn(),
  hash: jest.fn(),
}));

describe('hashPassword', () => {
  it('should hash a password using bcrypt', async () => {
    // Setup
    const password = 'testpassword';
    const salt = 'randomsalt';
    const hashedPassword = 'hashedversionofpassword';

    // Mock bcrypt.genSalt and bcrypt.hash to return predefined values
    bcrypt.genSalt.mockResolvedValue(salt);
    bcrypt.hash.mockResolvedValue(hashedPassword);

    // Execute
    const result = await hashPassword(password);

    // Assert
    expect(bcrypt.genSalt).toHaveBeenCalledWith(10);
    expect(bcrypt.hash).toHaveBeenCalledWith(password, salt);
    expect(result).toBe(hashedPassword);
  });
});
