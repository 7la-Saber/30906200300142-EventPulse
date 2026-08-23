const express = require('express');
const { registerForEvent, getMyRegistrations, cancelRegistration } = require('../controllers/registrationController');
const { requireAuth } = require('../middleware/authMiddleware');

const router = express.Router();


router.use(requireAuth);

router.post('/:eventId/register', registerForEvent);
router.get('/my-registrations', getMyRegistrations);
router.delete('/:id', cancelRegistration);

module.exports = router;