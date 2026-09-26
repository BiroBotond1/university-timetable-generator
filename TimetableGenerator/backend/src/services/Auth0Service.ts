/**
 * Asks Auth0 who the bearer of this access token is.
 *
 * The access token carries `sub` but not necessarily an email, and the email a
 * client sends us is just a hint. Project invitations are bound by email, so
 * that binding needs an address Auth0 itself vouches for.
 *
 * Returns null when the token cannot be exchanged (for example when the client
 * did not request the `email` scope) -- callers must treat that as "no verified
 * email" rather than falling back to the client's value.
 */
export const fetchUserInfo = async (rawToken) => {
  try {
    const response = await fetch(`${process.env.ISSUER_BASE_URL}userinfo`, {
      headers: { Authorization: `Bearer ${rawToken}` }
    });

    if (!response.ok) {
      console.warn('Auth0 userinfo returned', response.status);
      return null;
    }

    return await response.json();
  } catch (error) {
    console.warn('Could not reach Auth0 userinfo:', error.message);
    return null;
  }
};

/** The email address, only if Auth0 reports it as verified. */
export const getVerifiedEmail = (userInfo) => {
  if (!userInfo?.email || userInfo.email_verified !== true) return null;

  return String(userInfo.email).trim().toLowerCase();
};
