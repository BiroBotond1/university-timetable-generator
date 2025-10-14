import * as service from '../services/ClassHourService.js'

export const getAll = async (req, res) => {
  try {
    const classHours = await service.getAll();
    res.json({ data: classHours, status: 'success' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const create = async (req, res) => {
  try {
    const classHour = await service.create(req.body);
    res.status(201).json({ data: classHour, status: 'success' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getById = async (req, res) => {
  try {
    const classHour = await service.getById(req.params.id);
    if (!classHour) {
      return res.status(404).json({ error: 'Class hour not found' });
    }
    res.json({ data: classHour, status: 'success' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const update = async (req, res) => {
  try {
    const classHour = await service.update(req.params.id, req.body);
    if (!classHour) {
      return res.status(404).json({ error: 'Class hour not found' });
    }
    res.json({ data: classHour, status: 'success' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const deleteById = async (req, res) => {
  try {
    const classHour = await service.deleteById(req.params.id);
    if (!classHour) {
      return res.status(404).json({ error: 'Class hour not found' });
    }
    res.json({ data: classHour, status: 'success' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
