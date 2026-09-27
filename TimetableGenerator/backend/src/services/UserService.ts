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

// username and email come from the client and are not verified, so don't bind
// invitations to this email.
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

export const getOrCreateByAuth0Id = async (auth0Id) => {
  const existing = await model.findOne({ auth0Id });

  if (existing) return existing;

  return await model.create({ auth0Id });
};