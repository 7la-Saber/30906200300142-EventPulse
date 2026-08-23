const Registration = require('../models/Registration');
const Event = require('../models/Event');


exports.registerForEvent = async (req, res) => {
  try {
    const eventId = req.params.eventId;
    const userId = req.user.id;


    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }


    const existingRegistration = await Registration.findOne({ event: eventId, user: userId });
    if (existingRegistration) {
      return res.status(400).json({ message: 'You are already registered for this event' });
    }


    const currentRegistrations = await Registration.countDocuments({ event: eventId });
    if (currentRegistrations >= event.capacity) {
      return res.status(400).json({ message: 'Event is fully booked' });
    }


    const registration = await Registration.create({ event: eventId, user: userId });
    res.status(201).json({ message: 'Successfully registered', registration });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getMyRegistrations = async (req, res) => {
  try {
    const registrations = await Registration.find({ user: req.user.id })
      .populate('event', 'title date city'); 
    res.status(200).json(registrations);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.cancelRegistration = async (req, res) => {
  try {
    const registrationId = req.params.id;

    const registration = await Registration.findById(registrationId);
    
    if (!registration) {
      return res.status(404).json({ message: 'Registration not found' });
    }


    if (registration.user.toString() !== req.user.id) {
       return res.status(403).json({ message: 'Not authorized to cancel this registration' });
    }

    await registration.deleteOne();
    res.status(200).json({ message: 'Registration cancelled successfully' });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};