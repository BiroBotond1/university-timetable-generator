const express = require('express');
const {
  getAllClasses,
  createClass,
  getClassById,
  updateClass,
  deleteClass
} = require('../controllers/ClassController.js');

const router = express.Router();

router.route('/').get(getAllClasses).post(createClass);
router.route('/:id').get(getClassById).patch(updateClass).delete(deleteClass);

module.exports = router;
