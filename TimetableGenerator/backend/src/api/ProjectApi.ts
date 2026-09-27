import express from 'express'
import {
  getAll,
  getInvitations,
  create,
  getById,
  update,
  deleteById,
  getMembers,
  invite,
  respondToInvitation,
  removeMember,
  revokeInvitation,
  leaveProject,
  transferOwnership
} from '../controllers/ProjectController.js'
import {
  requireProjectAccess,
  requireProjectOwner
} from '../middleware/projectAccess.js'

const router = express.Router();

router.route('/').get(getAll).post(create);

// Must be declared before '/:projectId' or it is swallowed by it.
router.route('/invitations').get(getInvitations);

// Answering an invitation is the one project route a non-member may call.
router.route('/:projectId/invitation').post(respondToInvitation);

router.route('/:projectId')
  .get(requireProjectAccess, getById)
  .patch(requireProjectAccess, update)
  .delete(requireProjectAccess, requireProjectOwner, deleteById);

router.route('/:projectId/members')
  .get(requireProjectAccess, getMembers)
  .post(requireProjectAccess, requireProjectOwner, invite);

router.route('/:projectId/members/:userId')
  .delete(requireProjectAccess, requireProjectOwner, removeMember);

router.route('/:projectId/invitations/:memberId')
  .delete(requireProjectAccess, requireProjectOwner, revokeInvitation);

// Any member may leave; the service refuses the owner.
router.route('/:projectId/leave')
  .post(requireProjectAccess, leaveProject);

router.route('/:projectId/ownership')
  .post(requireProjectAccess, requireProjectOwner, transferOwnership);

export default router;
