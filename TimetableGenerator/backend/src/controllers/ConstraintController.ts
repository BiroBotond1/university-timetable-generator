import * as service from '../services/ConstraintService.js'

export const getAll = async (req, res) => {
  try {
    const constraints = await service.getAll(req.context.projectId);
    res.json({ data: constraints, status: 'success' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const create = async (req, res) => {
  try {
    const constraint = await service.create(req.context.projectId, req.body);
    res.status(201).json({ data: constraint, status: 'success' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getById = async (req, res) => {
  try {
    const constraint = await service.getById(req.context.projectId, req.params.id);
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
    const constraint = await service.update(req.context.projectId, req.params.id, req.body);
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
    const constraint = await service.deleteById(req.context.projectId, req.params.id);
    if (!constraint) {
      return res.status(404).json({ error: 'Constraint not found' });
    }
    res.json({ data: constraint, status: 'success' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
