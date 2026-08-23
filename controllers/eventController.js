const Event = require('../models/Event');
const asyncHandler = require('../utils/asyncHandler');
const AppError = require('../utils/AppError');
const Category = require('../models/Category');

exports.createEvent = asyncHandler(async (req, res, next) => {
  const event = await Event.create(req.body);
  res.status(201).json(event);
});

exports.getEvents = asyncHandler(async (req, res, next) => {
  const { search, category, city, startDate, endDate, sort, page = 1, limit = 10 } = req.query;
  let query = {};

  if (search) {
    query.$or = [
      { title: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } }
    ];
  }

  if (category) query.category = category;
  if (city) query.city = city;
  
  if (startDate || endDate) {
    query.date = {};
    if (startDate) query.date.$gte = new Date(startDate);
    if (endDate) query.date.$lte = new Date(endDate);
  }

  let sortBy = '-date'; 
  if (sort === 'date') sortBy = 'date';
  if (sort === 'popularity') sortBy = '-capacity'; 

  const skip = (page - 1) * limit;

  const events = await Event.find(query)
    .populate('category', 'name')
    .sort(sortBy)
    .skip(skip)
    .limit(parseInt(limit));

  const total = await Event.countDocuments(query);

  res.status(200).json({
    total,
    page: parseInt(page),
    pages: Math.ceil(total / limit),
    data: events
  });
});

exports.getEvent = asyncHandler(async (req, res, next) => {
  const event = await Event.findById(req.params.id).populate('category', 'name');
  if (!event) return next(new AppError('Event not found', 404));
  res.status(200).json(event);
});

exports.updateEvent = asyncHandler(async (req, res, next) => {
  const event = await Event.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!event) return next(new AppError('Event not found', 404));
  res.status(200).json(event);
});

exports.deleteEvent = asyncHandler(async (req, res, next) => {
  const event = await Event.findByIdAndDelete(req.params.id);
  if (!event) return next(new AppError('Event not found', 404));
  res.status(200).json({ message: 'Event deleted successfully' });
});