import express from 'express'
import { create as register, login } from '../controllers/UserController.js'

const router = express.Router();

router.route('/login').post(login);
router.route('/register').post(register);

export default router;