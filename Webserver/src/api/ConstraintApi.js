const express = require('express');
const {
  getAllConstraints,
  createConstraint,
  getConstraintById,
  updateConstraint,
  deleteConstraint
} = require('../controllers/ConstraintController.js');

const router = express.Router();

router.route('/').get(getAllConstraints).post(createConstraint);
router.route('/:id').get(getConstraintById).patch(updateConstraint).delete(deleteConstraint);

module.exports = router;