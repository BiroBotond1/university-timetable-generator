import * as projectService from '../services/ProjectService.js'

/**
 * Resolves `:projectId` and verifies the caller is an active member.
 *
 * Runs once per request so controllers and services below never re-derive the
 * project; they read `req.context.projectId` (ADR 0001).
 */
export const requireProjectAccess = async (req, res, next) => {
  const projectId = req.params.projectId;
  const user = req.context?.user;

  if (!user) {
    return res.status(401).json({ error: 'Unauthenticated' });
  }

  try {
    const membership = await projectService.getMembership(projectId, user._id);

    if (!membership) {
      // Deliberately 404 and not 403: whether a project exists is itself
      // information a non-member should not get.
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

/** Inviting, transferring ownership and deleting are owner-only. */
export const requireProjectOwner = (req, res, next) => {
  if (req.context?.role !== 'owner') {
    return res.status(403).json({ error: 'Only the project owner can do this' });
  }

  return next();
};
