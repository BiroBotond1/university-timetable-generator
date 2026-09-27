import mongoose from 'mongoose'

// A user's membership in a project, or a pending invitation. An invitation to
// an address with no account yet has user: null until they first sign in.
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

  // Lowercased. Used to bind invitations to users who sign up later.
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

projectMemberSchema.index({ user: 1, status: 1 });
projectMemberSchema.index({ project: 1 });
projectMemberSchema.index({ email: 1, status: 1 });
// Unbound invitations (user: null) are left out of the uniqueness check.
projectMemberSchema.index(
  { project: 1, user: 1 },
  { unique: true, partialFilterExpression: { user: { $type: 'objectId' } } }
);

export const model = mongoose.model('ProjectMember', projectMemberSchema);
