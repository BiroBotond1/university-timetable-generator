// Asks Auth0 for the token holder's profile, to get an email Auth0 has
// verified. Returns null on failure; treat the email as unverified then.
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

export const getVerifiedEmail = (userInfo) => {
  if (!userInfo?.email || userInfo.email_verified !== true) return null;

  return String(userInfo.email).trim().toLowerCase();
};
