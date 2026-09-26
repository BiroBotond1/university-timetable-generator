import * as service from '../services/ProjectService.js'

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
    const project = await service.remove(req.context.projectId);
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }
    res.json({ data: project, status: 'success' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getMembers = async (req, res) => {
  try {
    const members = await service.listMembers(req.context.projectId);
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
    res.status(201).json({ data: invitation, status: 'success' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

export const respondToInvitation = async (req, res) => {
  try {
    const accept = req.body.accept === true;
    const invitation = await service.respondToInvitation(
      req.params.projectId,
      req.context.user._id,
      accept
    );

    if (!invitation) {
      return res.status(404).json({ error: 'Invitation not found' });
    }

    res.json({ data: invitation, status: 'success' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const removeMember = async (req, res) => {
  try {
    const removed = await service.removeMember(
      req.context.projectId,
      req.params.userId
    );

    if (!removed) {
      return res.status(404).json({ error: 'Member not found' });
    }

    res.json({ data: removed, status: 'success' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

export const transferOwnership = async (req, res) => {
  try {
    const project = await service.transferOwnership(
      req.context.projectId,
      req.body.userId
    );

    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    res.json({ data: project, status: 'success' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};
