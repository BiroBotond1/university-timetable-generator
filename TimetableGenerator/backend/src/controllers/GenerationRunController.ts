import * as service from '../services/GenerationRunService.js'

export const getRecent = async (req, res) => {
  try {
    const runs = await service.getRecent(req.context.projectId);
    res.json({ data: runs, status: 'success' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
