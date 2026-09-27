import * as userService from '../services/UserService.js'

export const userContext = async (req, res, next) => {
  const auth0Id = req.auth?.payload?.sub;

  if (!auth0Id) {
    return res.status(401).json({ error: 'Unauthenticated' });
  }

  try {
    // A REST call can arrive before the socket sync has created the user.
    const user = await userService.getOrCreateByAuth0Id(auth0Id);

    req.context = { ...(req.context || {}), user };

    return next();
  } catch (err) {
    return next(err);
  }
};

export default userContext
