const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const appointmentController = require('../controllers/appointmentController');
const isDoctorMiddleware = require('../middleware/isDoctorMiddleware');
const upload = require('../middleware/uploadMiddleware');
const consultationController = require('../controllers/consultationController');


router.get('/moment/:consultationId', consultationController.viewConsultationMoment);

// Route to render the form to add a consultation
router.get('/add', consultationController.renderAddConsultationForm);

// Route to handle form submission
router.post('/add', consultationController.addConsultation);


module.exports = router;