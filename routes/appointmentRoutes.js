const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const appointmentController = require('../controllers/appointmentController');
const isDoctorMiddleware = require('../middleware/isDoctorMiddleware');
const upload = require('../middleware/uploadMiddleware');

router.get('/calendar',authMiddleware, isDoctorMiddleware, appointmentController.viewCalendar);

// Route for deleting a specific appointment
router.delete('/delete/:appointmentId', appointmentController.deleteAppointment);


router.get('/schedule/:patientId?', authMiddleware, appointmentController.renderScheduleAppointment);
router.post('/schedule',authMiddleware,upload.single('documents'), appointmentController.createOrUpdateAppointment);

// Route for viewing the details of a specific appointment
router.get('/details/:appointmentId', authMiddleware, appointmentController.viewAppointmentDetails);


// Route for rendering the edit form of a specific appointment
router.get('/edit/:appointmentId', authMiddleware, appointmentController.renderEditAppointmentForm);

// Route for updating the details of a specific appointment
router.post('/edit/:appointmentId', authMiddleware, upload.single('documents'), appointmentController.createOrUpdateAppointment);


module.exports = router;
