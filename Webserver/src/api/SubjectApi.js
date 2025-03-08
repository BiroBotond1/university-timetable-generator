const express = require('express');
const {
  getAllSubjects,
  createSubject,
  getSubjectById,
  updateSubject,
  deleteSubject
} = require('../controllers/SubjectController.js');

const router = express.Router();

router.route('/').get(getAllSubjects).post(createSubject);
router.route('/:id').get(getSubjectById).patch(updateSubject).delete(deleteSubject);

module.exports = router;