const User = require('../models/User');
const jwt = require('jsonwebtoken');
const asyncHandler = require('../utils/asyncHandler');
const AppError = require('../utils/AppError');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};
exports.register = asyncHandler(async (req, res, next) => {
  const { name, email, password, role } = req.body;

  const userExists = await User.findOne({ email });
  if (userExists) {
    if (next) {
      return next(new AppError('User already exists', 400));
    }
    return res.status(400).json({ status: 'fail', message: 'User already exists' });
  }

  const user = await User.create({ name, email, password, role });
  const token = generateToken(user._id);

  res.status(201).json({ 
    user: { id: user._id, name: user.name, email: user.email, role: user.role }, 
    token 
  });
});

exports.login = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });
  if (!user || !(await user.matchPassword(password))) {
    if (next) {
      return next(new AppError('Invalid email or password', 401));
    }
    return res.status(401).json({ status: 'fail', message: 'Invalid email or password' });
  }

  const token = generateToken(user._id);
  res.status(200).json({ 
    user: { id: user._id, name: user.name, email: user.email, role: user.role }, 
    token 
  });
});