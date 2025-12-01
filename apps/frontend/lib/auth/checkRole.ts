import type { Session } from "next-auth";

/**
 * Checks if the user has the required role
 * @param session - NextAuth session object
 * @param requiredRole - The role to check for ("organizer", "host", "provider", etc.)
 * @returns true if user has the required role, false otherwise
 */
export function hasRequiredRole(
  session: Session | null,
  requiredRole: string,
): boolean {
  if (!session?.user?.roles) {
    return false;
  }

  return session.user.roles.includes(requiredRole);
}
