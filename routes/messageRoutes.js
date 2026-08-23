const express = require('express');
const Message = require('../models/Message');
const { requireAuth } = require('../middleware/authMiddleware');

const router = express.Router();


router.get('/:eventId', requireAuth, async (req, res) => {
  try {
    const messages = await Message.find({ event: req.params.eventId }).sort('createdAt');
    res.status(200).json(messages);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;