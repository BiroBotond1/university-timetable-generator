import express from 'express'
import { getRecent } from '../controllers/GenerationRunController.js'

const router = express.Router();

// Read-only: GenerationService writes the runs as they happen.
router.route('/').get(getRecent);

export default router;
