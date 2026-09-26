import mongoose from 'mongoose'

/**
 * Membership of a user in a project, and pending invitations.
 *
 * Kept in its own collection rather than as arrays on Project: "list my
 * projects" runs on every login and would otherwise be a scan matching an
 * array element (ADR 0001).
 *
 * An invitation to somebody who has never logged in has no `user` yet -- it is
 * an `email` with status 'pending' until that address signs in, at which point
 * syncUser binds it.
 */
const projectMemberSchema = new mongoose.Schema({
  project: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: true,
  },

  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null,
  },

  // Lowercased. Only meaningful while an invitation is unbound.
  email: { type: String, default: null },

  role: {
    type: String,
    enum: ['owner', 'collaborator'],
    default: 'collaborator',
  },

  status: {
    type: String,
    enum: ['pending', 'active', 'declined'],
    default: 'pending',
  },

  invitedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  invitedAt: { type: Date, default: Date.now },
}, { timestamps: true });

// "list my projects" -- the most frequent query once projects exist.
projectMemberSchema.index({ user: 1, status: 1 });
// "who is on this project"
projectMemberSchema.index({ project: 1 });
// binding pending invitations at login
projectMemberSchema.index({ email: 1, status: 1 });
// a user appears at most once per project; `partialFilterExpression` keeps
// unbound invitations (user: null) out of the uniqueness check
projectMemberSchema.index(
  { project: 1, user: 1 },
  { unique: true, partialFilterExpression: { user: { $type: 'objectId' } } }
);

export const model = mongoose.model('ProjectMember', projectMemberSchema);
