import { model as Project } from '../models/Project.js'
import { model as ProjectMember } from '../models/ProjectMember.js'
import { model as User } from '../models/User.js'
import { model as Teacher } from '../models/Teacher.js'
import { model as Location } from '../models/Location.js'
import { model as Subject } from '../models/Subject.js'
import { model as Class } from '../models/Class.js'
import ClassHour from '../models/ClassHour.js'
import { model as Constraint } from '../models/Constraint.js'
import * as constraintService from './ConstraintService.js'

const normaliseEmail = (email) => (email || '').trim().toLowerCase()

/** Projects the user is an active member of, newest first. */
export const listForUser = async (userId) => {
  const memberships = await ProjectMember
    .find({ user: userId, status: 'active' })
    .populate('project')
    .sort({ createdAt: -1 });

  return memberships
    .filter((membership) => membership.project !== null)
    .map((membership) => ({
      ...membership.project.toObject(),
      role: membership.role,
    }));
};

/** Invitations addressed to this user that have not been answered yet. */
export const listInvitationsForUser = async (userId) => {
  return await ProjectMember
    .find({ user: userId, status: 'pending' })
    .populate('project')
    .populate('invitedBy', 'username email');
};

export const create = async (name, ownerId) => {
  const project = await Project.create({ name, owner: ownerId });

  await ProjectMember.create({
    project: project._id,
    user: ownerId,
    role: 'owner',
    status: 'active',
  });

  // Each project gets its own copy of the constraint set; they used to be
  // seven rows shared by everybody (ADR 0001).
  await constraintService.seedForProject(project._id);

  return project;
};

export const getById = async (projectId) => {
  return await Project.findById(projectId);
};

export const rename = async (projectId, name) => {
  return await Project.findByIdAndUpdate(projectId, { name }, { new: true });
};

/**
 * Deletes the project and everything in it.
 *
 * A hard cascade rather than a soft delete: soft deleting would mean a second
 * `deleted: false` filter on every entity query forever, with no benefit
 * unless an undelete UI were also built (ADR 0001). The UI asks the owner to
 * type the project name first, and offers an export.
 *
 * Class hours go first so nothing is left referencing a deleted class,
 * subject or teacher part-way through.
 */
export const remove = async (projectId) => {
  const project = await Project.findById(projectId);

  if (!project) return null;

  await ClassHour.deleteMany({ project: projectId });
  await Constraint.deleteMany({ project: projectId });
  await Subject.deleteMany({ project: projectId });
  await Class.deleteMany({ project: projectId });
  await Teacher.deleteMany({ project: projectId });
  await Location.deleteMany({ project: projectId });
  await ProjectMember.deleteMany({ project: projectId });

  await Project.findByIdAndDelete(projectId);

  return project;
};

export const setGenerationStatus = async (projectId, status) => {
  return await Project.findByIdAndUpdate(
    projectId,
    {
      generationStatus: status,
      generationStartedAt: status === 'idle' ? null : new Date(),
    },
    { new: true }
  );
};

/**
 * Generation state lives in memory, so a restart leaves any project that was
 * mid-run claiming to be busy forever. Cleared at boot.
 */
export const clearStaleGenerationStatus = async () => {
  const result = await Project.updateMany(
    { generationStatus: { $ne: 'idle' } },
    { $set: { generationStatus: 'idle', generationStartedAt: null } }
  );

  return result.modifiedCount;
};

/** The caller's membership, or null if they are not an active member. */
export const getMembership = async (projectId, userId) => {
  return await ProjectMember.findOne({
    project: projectId,
    user: userId,
    status: 'active',
  });
};

/**
 * Active members, and -- for callers allowed to manage them -- pending
 * invitations. Collaborators see who is on the project, but not which email
 * addresses have been invited and have not answered yet.
 */
export const listMembers = async (projectId, { includePending = false } = {}) => {
  const statuses = includePending ? ['active', 'pending'] : ['active'];

  return await ProjectMember
    .find({ project: projectId, status: { $in: statuses } })
    .populate('user', 'username email')
    .sort({ createdAt: 1 });
};

/**
 * Invites an email address. If that address already belongs to a user the
 * invitation is bound immediately; otherwise it waits for them to sign in.
 */
export const invite = async (projectId, email, invitedById) => {
  const normalised = normaliseEmail(email);

  if (!normalised) {
    throw new Error('An email address is required');
  }

  const invitee = await User.findOne({ email: normalised });

  if (invitee) {
    const existing = await ProjectMember.findOne({
      project: projectId,
      user: invitee._id,
    });

    if (existing && existing.status === 'active') {
      throw new Error('That user is already a member of this project');
    }

    if (existing) {
      existing.status = 'pending';
      existing.invitedBy = invitedById;
      existing.invitedAt = new Date();
      return await existing.save();
    }
  } else {
    const existing = await ProjectMember.findOne({
      project: projectId,
      email: normalised,
      status: 'pending',
    });

    if (existing) {
      return existing;
    }
  }

  return await ProjectMember.create({
    project: projectId,
    user: invitee ? invitee._id : null,
    email: normalised,
    role: 'collaborator',
    status: 'pending',
    invitedBy: invitedById,
  });
};

export const respondToInvitation = async (projectId, userId, accept) => {
  const invitation = await ProjectMember.findOne({
    project: projectId,
    user: userId,
    status: 'pending',
  });

  if (!invitation) return null;

  invitation.status = accept ? 'active' : 'declined';

  return await invitation.save();
};

/**
 * Withdraws an invitation that has not been answered. Addressed by the
 * membership row rather than by user, because an invitation to someone with no
 * account yet has no user to address.
 */
export const revokeInvitation = async (projectId, memberId) => {
  return await ProjectMember.findOneAndDelete({
    _id: memberId,
    project: projectId,
    status: 'pending',
  });
};

export const removeMember = async (projectId, userId) => {
  const project = await Project.findById(projectId);

  if (project && String(project.owner) === String(userId)) {
    throw new Error('The owner cannot be removed; transfer ownership first');
  }

  return await ProjectMember.findOneAndDelete({
    project: projectId,
    user: userId,
  });
};

/**
 * A collaborator removing themselves. The owner cannot leave: a project with
 * no owner could never be managed or deleted again, so ownership has to be
 * handed over first (ADR 0001).
 */
export const leaveProject = async (projectId, userId) => {
  const project = await Project.findById(projectId);

  if (!project) return null;

  if (String(project.owner) === String(userId)) {
    throw new Error('The owner cannot leave the project; transfer ownership first');
  }

  return await ProjectMember.findOneAndDelete({
    project: projectId,
    user: userId,
    status: 'active',
  });
};

/**
 * Hands the project to an existing active collaborator. The previous owner
 * stays on as a collaborator, which is what makes it safe for them to leave
 * afterwards (ADR 0001).
 */
export const transferOwnership = async (projectId, newOwnerId) => {
  const project = await Project.findById(projectId);

  if (!project) return null;

  const incoming = await ProjectMember.findOne({
    project: projectId,
    user: newOwnerId,
    status: 'active',
  });

  if (!incoming) {
    throw new Error('The new owner must already be a member of the project');
  }

  const outgoing = await ProjectMember.findOne({
    project: projectId,
    user: project.owner,
  });

  if (outgoing) {
    outgoing.role = 'collaborator';
    await outgoing.save();
  }

  incoming.role = 'owner';
  await incoming.save();

  project.owner = newOwnerId;

  return await project.save();
};

/**
 * Attaches invitations addressed to this user's email once they sign in.
 *
 * Only called with an email Auth0 has marked verified -- an unverified address
 * would otherwise be a way into somebody else's project (ADR 0001).
 */
export const bindPendingInvitations = async (userId, verifiedEmail) => {
  const normalised = normaliseEmail(verifiedEmail);

  if (!normalised) return 0;

  const result = await ProjectMember.updateMany(
    { email: normalised, user: null, status: 'pending' },
    { $set: { user: userId } }
  );

  return result.modifiedCount;
};
