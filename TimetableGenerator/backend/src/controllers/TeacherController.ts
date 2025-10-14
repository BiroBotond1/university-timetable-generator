import * as service from '../services/TeacherService.js'
import * as classHourService from '../services/ClassHourService.js'

export const getAll = async (req, res) => {
  try {
    const teachers = await service.getAll();
    res.json({ data: teachers, status: 'success' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const create = async (req, res) => {
  try {
    const teacher = await service.create(req.body);
    res.status(201).json({ data: teacher, status: 'success' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getById = async (req, res) => {
  try {
    const teacher = await service.getById(req.params.id);
    if (!teacher) {
      return res.status(404).json({ error: 'Teacher not found' });
    }
    res.json({ data: teacher, status: 'success' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const update = async (req, res) => {
  try {
    const teacher = await service.update(req.params.id, req.body);
    if (!teacher) {
      return res.status(404).json({ error: 'Teacher not found' });
    }
    res.json({ data: teacher, status: 'success' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const deleteById = async (req, res) => {
  try {
    if (await classHourService.isTeacherUsed(req.params.id)) {
      return res.status(409).json({error: 'Teacher cannot be deleted because it is used'});
    }

    const teacher = await service.deleteById(req.params.id);
    if (!teacher) {
      return res.status(404).json({ error: 'Teacher not found' });
    }
    res.json({ data: teacher, status: 'success' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
