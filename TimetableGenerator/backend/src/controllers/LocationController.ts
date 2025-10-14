import * as service from '../services/LocationService.js'
import * as subjectService from '../services/SubjectService.js'

export const getAll = async (req, res) => {
  try {
    const locations = await service.getAll();
    res.json({ data: locations, status: 'success' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const create = async (req, res) => {
  try {
    const location = await service.create(req.body);
    res.status(201).json({ data: location, status: 'success' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getById = async (req, res) => {
  try {
    const location = await service.getById(req.params.id);
    if (!location) {
      return res.status(404).json({ error: 'Location not found' });
    }
    res.json({ data: location, status: 'success' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const update = async (req, res) => {
  try {
    const location = await service.update(req.params.id, req.body);
    if (!location) {
      return res.status(404).json({ error: 'Location not found' });
    }
    res.json({ data: location, status: 'success' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const deleteById = async (req, res) => {
  try {
    if (await subjectService.isLocationUsed(req.params.id)) {
      return res.status(409).json({error: 'Location cannot be deleted because it is used'});
    }

    const location = await service.deleteById(req.params.id);
    if (!location) {
      return res.status(404).json({ error: 'Location not found' });
    }
    res.json({ data: location, status: 'success' });
  } catch (err) {
    res.status(500).json({ error: err.message, alma: req });
  }
};
