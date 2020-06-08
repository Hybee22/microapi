const express = require('express');
const router = express.Router();

const authController = require('../controllers/authController');

// AUTH ROUTES
router.post('/signup', authController.signupUser);
router.post('/login', authController.loginUser);

module.exports = router;

// router.post('/login/tutor', authController.loginTutor);
