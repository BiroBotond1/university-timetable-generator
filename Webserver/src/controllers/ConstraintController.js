const constraintService = require('../services/ConstraintService.js');

exports.getAllConstraints = async (req, res) => {
  try {
    const constraints = await constraintService.getAllConstraints();
    res.json({ data: constraints, status: 'success' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.createConstraint = async (req, res) => {
  try {
    const constraint = await constraintService.createConstraint(req.body);
    res.status(201).json({ data: constraint, status: 'success' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getConstraintById = async (req, res) => {
  try {
    const constraint = await constraintService.getConstraintById(req.params.id);
    if (!constraint) {
      return res.status(404).json({ error: 'Constraint not found' });
    }
    res.json({ data: constraint, status: 'success' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateConstraint = async (req, res) => {
  try {
    const constraint = await constraintService.updateConstraint(req.params.id, req.body);
    if (!constraint) {
      return res.status(404).json({ error: 'Constraint not found' });
    }
    res.json({ data: constraint, status: 'success' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.deleteConstraint = async (req, res) => {
  try {
    const constraint = await constraintService.deleteConstraint(req.params.id);
    if (!constraint) {
      return res.status(404).json({ error: 'Constraint not found' });
    }
    res.json({ data: constraint, status: 'success' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
