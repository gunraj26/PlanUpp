// Hardcoded admin ID - this is the only admin user
export const ADMIN_ID = "366ffd3c-0a25-4767-8802-70a5285d9226"

/**
 * Check if a user is the admin
 * @param {Object} user - The user object from auth context
 * @returns {boolean} - True if the user is the admin
 */
export function isAdmin(user) {
  if (!user) return false
  return user.id === ADMIN_ID
}

