const express = require('express');
const { body } = require('express-validator');
const { createEvent, getEvents, getEvent, updateEvent, deleteEvent } = require('../controllers/eventController');
const { requireAuth, requireRole } = require('../middleware/authMiddleware');
const validateRequest = require('../middleware/validateRequest');

const router = express.Router();

const eventValidation = [
  body('title').notEmpty().withMessage('Title is required'),
  body('date').isISO8601().withMessage('Valid date is required'),
  body('city').notEmpty().withMessage('City is required'),
  body('capacity').isInt({ min: 1 }).withMessage('Capacity must be a positive number'),
  validateRequest
];

router.route('/')
  .post(requireAuth, requireRole('admin'), eventValidation, createEvent)
  .get(getEvents);

router.route('/:id')
  .get(getEvent)
  .patch(requireAuth, requireRole('admin'), eventValidation, updateEvent)
  .delete(requireAuth, requireRole('admin'), deleteEvent);

module.exports = router;