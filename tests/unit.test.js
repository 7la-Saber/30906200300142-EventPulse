const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');

describe('Unit Tests: Error Utilities', () => {
  

  it('should create an AppError with correct properties', () => {
    const error = new AppError('Item not found', 404);
    
    expect(error.message).toBe('Item not found');
    expect(error.statusCode).toBe(404);
    expect(error.status).toBe('fail');
    expect(error.isOperational).toBe(true);
  });

  it('should execute the function successfully without calling next', async () => {
    const req = {};
    const res = {};
    const next = jest.fn(); 
    const mockFn = jest.fn().mockResolvedValue('Success');

    await asyncHandler(mockFn)(req, res, next);
    
    expect(mockFn).toHaveBeenCalledWith(req, res, next);
    expect(next).not.toHaveBeenCalled();
  });

  it('should catch errors and pass them to next', async () => {
    const req = {};
    const res = {};
    const next = jest.fn();
    const error = new Error('Something went wrong');
    const mockFn = jest.fn().mockRejectedValue(error); 

    await asyncHandler(mockFn)(req, res, next);
    
    expect(next).toHaveBeenCalledWith(error);
  });
});