const express = require('express');
const router = express.Router();
const { registerUser, loginUser, notifyLogin } = require('../controllers/authController');

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/notify-login', notifyLogin);

module.exports = router;
