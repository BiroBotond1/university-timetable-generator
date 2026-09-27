import * as projectService from '../services/ProjectService.js'

export const requireProjectAccess = async (req, res, next) => {
  const projectId = req.params.projectId;
  const user = req.context?.user;

  if (!user) {
    return res.status(401).json({ error: 'Unauthenticated' });
  }

  try {
    const membership = await projectService.getMembership(projectId, user._id);

    if (!membership) {
      // 404 rather than 403, so a non-member can't tell whether the project exists.
      return res.status(404).json({ error: 'Project not found' });
    }

    req.context = {
      ...req.context,
      projectId,
      role: membership.role,
    };

    return next();
  } catch (err) {
    return next(err);
  }
};

export const requireProjectOwner = (req, res, next) => {
  if (req.context?.role !== 'owner') {
    return res.status(403).json({ error: 'Only the project owner can do this' });
  }

  return next();
};
