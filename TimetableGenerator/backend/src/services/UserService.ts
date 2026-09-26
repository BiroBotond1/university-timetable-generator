import { model } from '../models/User.js'

// export const getAll = async () => {
//   return await model.find();
// };

// export const create = async (user) => {
//   return await model.create(user);
// };

// export const getById = async (id) => {
//   return await model.findById(id);
// };

// export const update = async (id, user) => {
//   return await model.findByIdAndUpdate(id, user);
// };

// export const deleteById = async (id) => {
//   return await model.findByIdAndRemove(id);
// };

/**
 * Upserts the Mongo user for an authenticated Auth0 identity.
 *
 * `auth0Id` is taken from the verified handshake token by the caller. The
 * username and email are client-supplied profile hints and are NOT verified --
 * do not bind project invitations to this email without checking Auth0's
 * `email_verified` claim first (ADR 0001).
 */
export const syncUser = async (auth0User) => {

  // Find existing
  let user = await model.findOne({ auth0Id: auth0User.auth0Id });

  if (!user) {
    // Create new
    user = await model.create({
      ...auth0User
    });
  } else {
    // Update
    user.username = auth0User.username;
    user.email = auth0User.email;
    await user.save();
  }

  return user;
};

export const getByAuth0Id = async (auth0Id) => {
  return await model.findOne({ auth0Id });
};

/**
 * Used by the REST context middleware. The socket sync normally creates this
 * row at login, but a REST call can arrive first, so fall back to a minimal
 * record rather than rejecting an otherwise valid request.
 */
export const getOrCreateByAuth0Id = async (auth0Id) => {
  const existing = await model.findOne({ auth0Id });

  if (existing) return existing;

  return await model.create({ auth0Id });
};