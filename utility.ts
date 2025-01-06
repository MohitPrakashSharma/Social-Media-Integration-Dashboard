
export async function getProfileFromCookies(platform: string) {
  try {
    const profileCookie = localStorage.get(`${platform}_profile`);

    if (!profileCookie) {
      return null;
    }

    return JSON.parse(profileCookie.value);
  } catch (error) {
    console.error('Profile fetch error:', error);
    throw new Error('Failed to fetch profile');
  }
}
