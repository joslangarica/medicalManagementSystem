const express = require('express');
const router = express.Router();
const doctorController = require('../controllers/doctorController');
const dashboardController = require('../controllers/dashboardController');
const authMiddleware = require('../middleware/authMiddleware');
const isDoctorMiddleware = require('../middleware/isDoctorMiddleware');
const upload = require('../middleware/uploadMiddleware');


// Route to show the form for creating a doctor profile
router.get('/createProfile', authMiddleware,isDoctorMiddleware, doctorController.showInitialProfileCreation);

// Route to handle the form submission for creating a doctor profile
router.post('/createProfile', authMiddleware, isDoctorMiddleware, upload.single('profilePicture'), doctorController.createProfile);

// Show doctor profile form
router.get('/doctorProfile', authMiddleware, isDoctorMiddleware, doctorController.showProfileForm);

// Show edit doctor profile form
router.get('/edit', authMiddleware, doctorController.showProfileEditForm);

// Toute to handle edit doctor profile form
router.post('/edit', authMiddleware, upload.single('profilePicture'), doctorController.updateProfile);

// Doctor dashboard
router.get('/dashboard', authMiddleware, dashboardController.showDashboard);


module.exports = router;
