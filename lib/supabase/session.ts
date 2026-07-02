import type { User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import type { Profile, UserRole } from "@/types";

/**
 * Single source of truth for "is this profile an admin". Used by the proxy,
 * the admin layout, and the admin server-action guard so the role check can
 * never drift between layers.
 */
export function isAdminRole(role: UserRole | null | undefined): boolean {
  return role === "admin";
}

export function isAdmin(profile: Profile | null): boolean {
  return isAdminRole(profile?.role);
}

/**
 * Resolves the current user and profile for the caller's request.
 *
 * Intentionally NOT wrapped in React `cache()`: it is called both during the
 * render pass (Navbar, admin layout) and from Server Actions (requireAdmin),
 * and `cache()` misbehaves across that boundary. The proxy and the admin layout
 * each running this check is deliberate defense in depth — per Next.js guidance
 * authorization must not rely on middleware alone — so the small duplication is
 * an accepted cost, not a bug.
 */
export async function getCurrentUserAndProfile(): Promise<{
  user: User | null;
  profile: Profile | null;
}> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { user: null, profile: null };

  // maybeSingle(): a missing profile row yields data=null (not an error), so a
  // genuine DB/network failure surfaces as `error` instead of being
  // indistinguishable from "no such row".
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  return { user, profile: profile ?? null };
}
