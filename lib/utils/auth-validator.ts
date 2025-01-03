export function validateAuthAccess(isLoggedIn: boolean, hasUserParam: boolean) {
    // If user is logged in AND user parameter is missing,
    // grant full access
    if (isLoggedIn && !hasUserParam) {
      return {
        hasAccess: true,
        error: null,
      };
    }
  
    // If no user and no user parameter, restrict access
    if (!isLoggedIn && !hasUserParam) {
      return {
        hasAccess: false,
        error: 'This URL is not publicly accessible. Please log in to access.',
      };
    }
  
    // Allow access for valid login attempts or already logged in users
    return {
      hasAccess: true,
      error: null,
    };
  }