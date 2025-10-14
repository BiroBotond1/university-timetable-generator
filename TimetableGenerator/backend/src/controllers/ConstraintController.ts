import * as service from '../services/ConstraintService.js'

export const getAll = async (req, res) => {
  try {
    const constraints = await service.getAll();
    res.json({ data: constraints, status: 'success' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const create = async (req, res) => {
  try {
    const constraint = await service.create(req.body);
    res.status(201).json({ data: constraint, status: 'success' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getById = async (req, res) => {
  try {
    const constraint = await service.getById(req.params.id);
    if (!constraint) {
      return res.status(404).json({ error: 'Constraint not found' });
    }
    res.json({ data: constraint, status: 'success' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const update = async (req, res) => {
  try {
    const constraint = await service.update(req.params.id, req.body);
    if (!constraint) {
      return res.status(404).json({ error: 'Constraint not found' });
    }
    res.json({ data: constraint, status: 'success' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const deleteById = async (req, res) => {
  try {
    const constraint = await service.deleteById(req.params.id);
    if (!constraint) {
      return res.status(404).json({ error: 'Constraint not found' });
    }
    res.json({ data: constraint, status: 'success' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
