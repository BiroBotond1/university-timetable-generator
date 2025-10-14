import express from 'express'
import {
  getAll,
  create,
  getById,
  update,
  deleteById
} from '../controllers/ClassHourController.js'

const router = express.Router();

router.route('/').get(getAll).post(create);
router.route('/:id').get(getById).patch(update).delete(deleteById);

export default router;