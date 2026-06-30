import { useAuth, type Organization } from "@/contexts/auth-context"

// The dashboard doesn't have an organization switcher yet, so the active
// organization is just the user's first membership. Revisit once multi-org
// switching is wired up.
export function useActiveOrganization(): Organization | null {
  const { user } = useAuth()
  return user?.organizations?.[0] ?? null
}
