const express = require('express');
const router = express.Router();



// home page
const homeRoutes = require('./homeRoutes');
router.use('/', homeRoutes);

// User 
const userRoutes = require('./userRoutes');
router.use('/users', userRoutes);

// Doctor
const doctorRoutes = require('./doctorRoutes');
router.use('/doctors', doctorRoutes);

// Patient
const patientRoutes = require('./patientRoutes');
router.use('/patients', patientRoutes);

// Appointment
const appointmentRoutes = require('./appointmentRoutes');
router.use('/appointments', appointmentRoutes);

// Consultation
const consultationRoutes = require('./consultationRoutes');
router.use('/consultations', consultationRoutes);

module.exports = router;
