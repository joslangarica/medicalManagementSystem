const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authMiddleware = require('../middleware/authMiddleware');


// Show Registration Form
router.get('/register', userController.showRegisterForm);
// User Registration
router.post('/register', userController.register);

// Show Login Form
router.get('/login', userController.showLoginForm);
// User Login
router.post('/login', userController.login);

// Logout
router.get('/logout', userController.logout);

// update user auth 
router.post('/updateAuthDetails', authMiddleware ,userController.updateAuthDetails);





module.exports = router;
