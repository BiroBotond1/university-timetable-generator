import * as service from '../services/SubjectService.js'
import * as classHourService from '../services/ClassHourService.js'

export const getAll = async (req, res) => {
  try {
    const subjects = await service.getAll();
    res.json({ data: subjects, status: 'success' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const create = async (req, res) => {
  try {
    const subject = await service.create(req.body);
    res.status(201).json({ data: subject, status: 'success' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getById = async (req, res) => {
  try {
    const subject = await service.getById(req.params.id);
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
    const subject = await service.update(req.params.id, req.body);
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
    if (await classHourService.isSubjectUsed(req.params.id)) {
      return res.status(409).json({error: 'Subject cannot be deleted because it is used'});
    }

    const subject = await service.deleteById(req.params.id);
    if (!subject) {
      return res.status(404).json({ error: 'Subject not found' });
    }
    res.json({ data: subject, status: 'success' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
