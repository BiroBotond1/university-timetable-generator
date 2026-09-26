import * as userService from '../services/UserService.js'

/**
 * Bridges the validated JWT to the data layer.
 *
 * `express-oauth2-jwt-bearer` verifies the token and leaves the claims on
 * `req.auth`, but nothing read them before this. Everything downstream takes
 * the caller from `req.context.user`.
 */
export const userContext = async (req, res, next) => {
  const auth0Id = req.auth?.payload?.sub;

  if (!auth0Id) {
    return res.status(401).json({ error: 'Unauthenticated' });
  }

  try {
    // The socket sync normally creates this row at login; a REST call can still
    // arrive first, so fall back to a minimal record rather than failing.
    const user = await userService.getOrCreateByAuth0Id(auth0Id);

    req.context = { ...(req.context || {}), user };

    return next();
  } catch (err) {
    return next(err);
  }
};

export default userContext
