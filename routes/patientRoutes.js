const express = require('express');
const router = express.Router();
const patientController = require('../controllers/patientController');
const authMiddleware = require('../middleware/authMiddleware');
const dashboardController = require('../controllers/dashboardController');
const isDoctorMiddleware = require('../middleware/isDoctorMiddleware');
const upload = require('../middleware/uploadMiddleware');

// Route to show patients home
router.get('/', authMiddleware,isDoctorMiddleware, dashboardController.showPatientsTable);

// Static route for adding a patient
router.get('/add', authMiddleware, isDoctorMiddleware, patientController.showAddPatientForm);
router.post('/add', authMiddleware, isDoctorMiddleware, upload.single('photo'), patientController.addPatient);


// Dynamic routes for editing medical history
//router.get('/:id/medicalHistory/edit', authMiddleware, isDoctorMiddleware, patientController.showEditMedicalHistoryForm);
//router.post('/:id/medicalHistory', authMiddleware, isDoctorMiddleware, patientController.addOrUpdateMedicalHistory);


// Route to show patient profile
router.get('/:patientId', authMiddleware, patientController.showPatientProfile);

// Route to edit patient profile
router.get('/edit/:id', authMiddleware, patientController.showEditPatientForm);
router.post('/edit/:id', authMiddleware, patientController.editPatient);

module.exports = router;