import * as service from '../services/SubjectService.js'
import * as classHourService from '../services/ClassHourService.js'

export const getAll = async (req, res) => {
  try {
    const subjects = await service.getAll(req.context.projectId);
    res.json({ data: subjects, status: 'success' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const create = async (req, res) => {
  try {
    const subject = await service.create(req.context.projectId, req.body);
    res.status(201).json({ data: subject, status: 'success' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getById = async (req, res) => {
  try {
    const subject = await service.getById(req.context.projectId, req.params.id);
    if (!subject) {
      return res.status(404).json({ error: 'Subject not found' });
    }
    res.json({ data: subject, status: 'success' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const update = async (req, res) => {
  try {
    const subject = await service.update(req.context.projectId, req.params.id, req.body);
    if (!subject) {
      return res.status(404).json({ error: 'Subject not found' });
    }
    res.json({ data: subject, status: 'success' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const deleteById = async (req, res) => {
  try {
    if (await classHourService.isSubjectUsed(req.context.projectId, req.params.id)) {
      return res.status(409).json({error: 'Subject cannot be deleted because it is used'});
    }

    const subject = await service.deleteById(req.context.projectId, req.params.id);
    if (!subject) {
      return res.status(404).json({ error: 'Subject not found' });
    }
    res.json({ data: subject, status: 'success' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
