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

  await constraintService.seedForProject(project._id);

  return project;
};

export const getById = async (projectId) => {
  return await Project.findById(projectId);
};

export const rename = async (projectId, name) => {
  return await Project.findByIdAndUpdate(projectId, { name }, { new: true });
};

// Class hours first, so nothing is left pointing at a deleted class, subject
// or teacher part-way through.
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

// Generation state lives in memory, so after a restart any project that was
// mid-run would stay marked busy forever. Called at boot.
export const clearStaleGenerationStatus = async () => {
  const result = await Project.updateMany(
    { generationStatus: { $ne: 'idle' } },
    { $set: { generationStatus: 'idle', generationStartedAt: null } }
  );

  return result.modifiedCount;
};

export const getMembership = async (projectId, userId) => {
  return await ProjectMember.findOne({
    project: projectId,
    user: userId,
    status: 'active',
  });
};

export const listMembers = async (projectId, { includePending = false } = {}) => {
  const statuses = includePending ? ['active', 'pending'] : ['active'];

  return await ProjectMember
    .find({ project: projectId, status: { $in: statuses } })
    .populate('user', 'username email')
    .sort({ createdAt: 1 });
};

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

// By membership id, because an unbound invitation has no user to look up.
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

// Only call this with an email Auth0 has verified: an unverified address would
// let anyone claim invitations sent to it.
export const bindPendingInvitations = async (userId, verifiedEmail) => {
  const normalised = normaliseEmail(verifiedEmail);

  if (!normalised) return 0;

  const result = await ProjectMember.updateMany(
    { email: normalised, user: null, status: 'pending' },
    { $set: { user: userId } }
  );

  return result.modifiedCount;
};
