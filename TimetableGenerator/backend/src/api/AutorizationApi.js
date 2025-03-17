const express = require('express');

const {
  createUser,
  login
} = require('../controllers/UserController.js');

const router = express.Router();

router.route('/login').post(login);
router.route('/register').post(createUser);

module.exports = router;