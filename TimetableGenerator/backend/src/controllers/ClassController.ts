import * as service from '../services/ClassService.js'
import * as classHourService from '../services/ClassHourService.js'

export const getAll = async (req, res) => {
  try {
    const classes = await service.getAll(req.context.projectId);
    res.json({ data: classes, status: 'success' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const create = async (req, res) => {
  try {
    const clas = await service.create(req.context.projectId, req.body);
    res.status(201).json({ data: clas, status: 'success' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getById = async (req, res) => {
  try {
    const clas = await service.getById(req.context.projectId, req.params.id);
    if (!clas) {
      return res.status(404).json({ error: 'Class not found' });
    }
    res.json({ data: clas, status: 'success' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const update = async (req, res) => {
  try {
    const clas = await service.update(req.context.projectId, req.params.id, req.body);
    if (!clas) {
      return res.status(404).json({ error: 'Class not found' });
    }
    res.json({ data: clas, status: 'success' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const deleteById = async (req, res) => {
  try {
    if (await classHourService.isClassUsed(req.context.projectId, req.params.id)) {
      return res.status(409).json({error: 'Class cannot be deleted because it is used'});
    }

    const clas = await service.deleteById(req.context.projectId, req.params.id);
    if (!clas) {
      return res.status(404).json({ error: 'Class not found' });
    }
    res.json({ data: clas, status: 'success' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
