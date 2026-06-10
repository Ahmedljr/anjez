import { cache } from "react";
import { headers } from "next/headers";

/** The validated user identity for the current request. */
export interface RequestUser {
  id: string;
  email: string | null;
  name: string | null;
}

/**
 * The authenticated user for the current request, read from the identity
 * headers the middleware sets after it validates the session. This avoids a
 * second `auth.getUser()` network round-trip per navigation — the middleware
 * has already verified the user and is the only trusted source of these headers.
 *
 * Wrapped in React `cache()` so layout and page share one header read.
 */
export const getCurrentUser = cache(async (): Promise<RequestUser | null> => {
  const h = await headers();
  const id = h.get("x-user-id");
  if (!id) return null;

  const name = h.get("x-user-name");
  return {
    id,
    email: h.get("x-user-email"),
    name: name ? decodeURIComponent(name) : null,
  };
});
