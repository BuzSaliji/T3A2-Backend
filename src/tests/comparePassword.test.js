const bcrypt = require('bcryptjs');
const { comparePassword } = require('../functions/userAuthFunctions');

// Mock bcrypt.compare
jest.mock('bcryptjs', () => ({
  compare: jest.fn(),
}));

describe('comparePassword', () => {
  it('should return true when passwords match', async () => {
    const plaintext = 'testpassword';
    const hashed = 'hashedversionofpassword';

    // Mock bcrypt.compare to return true for this test
    bcrypt.compare.mockResolvedValue(true);

    // Execute
    const result = await comparePassword(plaintext, hashed);

    // Assert
    expect(result).toBe(true);
    expect(bcrypt.compare).toHaveBeenCalledWith(plaintext, hashed);
  });

  it('should return false when passwords do not match', async () => {
    const plaintext = 'testpassword';
    const wrongHashed = 'wronghashedpassword';

    // Mock bcrypt.compare to return false for this test
    bcrypt.compare.mockResolvedValue(false);

    const result = await comparePassword(plaintext, wrongHashed);

    // Assert
    expect(result).toBe(false);
    expect(bcrypt.compare).toHaveBeenCalledWith(plaintext, wrongHashed);
  });
});
