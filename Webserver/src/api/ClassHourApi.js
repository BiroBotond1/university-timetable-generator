const express = require('express');
const {
  getAllClassHours,
  createClassHour,
  getClassHourById,
  updateClassHour,
  deleteClassHour
} = require('../controllers/ClassHourController.js');

const router = express.Router();

router.route('/').get(getAllClassHours).post(createClassHour);
router.route('/:id').get(getClassHourById).patch(updateClassHour).delete(deleteClassHour);

module.exports = router;
