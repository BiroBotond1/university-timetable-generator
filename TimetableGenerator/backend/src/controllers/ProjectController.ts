import * as service from '../services/ProjectService.js'
import { evictFromProject, toProject, toUser } from '../socket/notify.js'

// After each change the affected clients are told over the socket:
//   invitationsChanged -> the invitee's badge
//   membersChanged     -> the Members page of everyone in the project
//   projectsChanged    -> a user's project list

export const getAll = async (req, res) => {
  try {
    const projects = await service.listForUser(req.context.user._id);
    res.json({ data: projects, status: 'success' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getInvitations = async (req, res) => {
  try {
    const invitations = await service.listInvitationsForUser(req.context.user._id);
    res.json({ data: invitations, status: 'success' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const create = async (req, res) => {
  try {
    if (!req.body?.name) {
      return res.status(400).json({ error: 'A project name is required' });
    }

    const project = await service.create(req.body.name, req.context.user._id);
    res.status(201).json({ data: project, status: 'success' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getById = async (req, res) => {
  try {
    const project = await service.getById(req.context.projectId);
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }
    res.json({
      data: { ...project.toObject(), role: req.context.role },
      status: 'success'
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const update = async (req, res) => {
  try {
    const project = await service.rename(req.context.projectId, req.body.name);
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }
    res.json({ data: project, status: 'success' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const deleteById = async (req, res) => {
  try {
    const projectId = req.context.projectId;

    // Read before the cascade removes the membership rows.
    const members = await service.listMembers(projectId);

    const project = await service.remove(projectId);
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    evictFromProject(projectId, null, 'deleted');
    members.forEach((member) => toUser(member.user?._id, 'projectsChanged'));

    res.json({ data: project, status: 'success' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getMembers = async (req, res) => {
  try {
    const members = await service.listMembers(req.context.projectId, {
      includePending: req.context.role === 'owner',
    });
    res.json({ data: members, status: 'success' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const invite = async (req, res) => {
  try {
    const invitation = await service.invite(
      req.context.projectId,
      req.body.email,
      req.context.user._id
    );

    // No-op when the address has no account yet.
    toUser(invitation.user, 'invitationsChanged', { reason: 'received' });
    toProject(req.context.projectId, 'membersChanged');

    res.status(201).json({ data: invitation, status: 'success' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

export const respondToInvitation = async (req, res) => {
  try {
    const accept = req.body.accept === true;
    const userId = req.context.user._id;
    const invitation = await service.respondToInvitation(
      req.params.projectId,
      userId,
      accept
    );

    if (!invitation) {
      return res.status(404).json({ error: 'Invitation not found' });
    }

    toUser(userId, 'invitationsChanged', { reason: accept ? 'accepted' : 'declined' });
    if (accept) toUser(userId, 'projectsChanged');
    toProject(req.params.projectId, 'membersChanged');

    res.json({ data: invitation, status: 'success' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const revokeInvitation = async (req, res) => {
  try {
    const invitation = await service.revokeInvitation(
      req.context.projectId,
      req.params.memberId
    );

    if (!invitation) {
      return res.status(404).json({ error: 'Invitation not found' });
    }

    toUser(invitation.user, 'invitationsChanged', { reason: 'revoked' });
    toProject(req.context.projectId, 'membersChanged');

    res.json({ data: invitation, status: 'success' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const removeMember = async (req, res) => {
  try {
    const projectId = req.context.projectId;
    const userId = req.params.userId;

    const removed = await service.removeMember(projectId, userId);

    if (!removed) {
      return res.status(404).json({ error: 'Member not found' });
    }

    evictFromProject(projectId, userId, 'removed');
    toUser(userId, 'projectsChanged');
    toProject(projectId, 'membersChanged');

    res.json({ data: removed, status: 'success' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

export const leaveProject = async (req, res) => {
  try {
    const projectId = req.context.projectId;
    const userId = req.context.user._id;

    const left = await service.leaveProject(projectId, userId);

    if (!left) {
      return res.status(404).json({ error: 'Membership not found' });
    }

    evictFromProject(projectId, userId, 'left');
    toUser(userId, 'projectsChanged');
    toProject(projectId, 'membersChanged');

    res.json({ data: left, status: 'success' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

export const transferOwnership = async (req, res) => {
  try {
    const previousOwnerId = req.context.user._id;
    const newOwnerId = req.body.userId;

    const project = await service.transferOwnership(
      req.context.projectId,
      newOwnerId
    );

    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    toProject(req.context.projectId, 'membersChanged');
    toUser(previousOwnerId, 'projectsChanged');
    toUser(newOwnerId, 'projectsChanged');

    res.json({ data: project, status: 'success' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};
