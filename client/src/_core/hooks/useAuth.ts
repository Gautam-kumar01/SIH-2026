import { useClerk, useUser } from "@clerk/react";
import { trpc } from "@/lib/trpc";
import { useCallback, useEffect, useMemo } from "react";

type UseAuthOptions = {
  redirectOnUnauthenticated?: boolean;
  redirectPath?: string;
};

export function useAuth(options?: UseAuthOptions) {
  const { redirectOnUnauthenticated = false, redirectPath = "/access" } =
    options ?? {};
  const { isLoaded, isSignedIn, user: clerkUser } = useUser();
  const clerk = useClerk();
  const utils = trpc.useUtils();
  const meQuery = trpc.auth.me.useQuery(undefined, {
    enabled: Boolean(isLoaded && isSignedIn),
    retry: 2,
    retryDelay: 800,
    refetchOnWindowFocus: true,
  });

  const logout = useCallback(async () => {
    await clerk.signOut({ redirectUrl: "/" });
    utils.auth.me.setData(undefined, null);
  }, [clerk, utils.auth.me]);

  // If the backend profile query is in transit or bootstrapping, construct a safe fallback from the authenticated Clerk session
  const effectiveUser = useMemo(() => {
    if (meQuery.data) return meQuery.data;
    if (isSignedIn && clerkUser) {
      const email = clerkUser.primaryEmailAddress?.emailAddress || "";
      const isSuperAdmin =
        email.toLowerCase().trim() === "gautamkr192007@gmail.com";
      const metaRole =
        (clerkUser.publicMetadata?.role as string) ||
        (clerkUser.unsafeMetadata?.role as string);
      const role = isSuperAdmin ? "SUPER_ADMIN" : metaRole || "citizen";
      return {
        id: 1,
        clerkUserId: clerkUser.id,
        name:
          clerkUser.fullName ||
          clerkUser.username ||
          (email ? email.split("@")[0] : "Authenticated User"),
        email: email || null,
        phone: null,
        loginMethod: "clerk",
        role: role as any,
        status: "ACTIVE" as any,
        designation: isSuperAdmin ? "System Administrator" : "Platform User",
        departmentId: null,
        districtId: null,
        organizationId: null,
        jurisdiction: null,
        invitationAcceptedAt: null,
        lastSignedIn: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
        canonicalRole: isSuperAdmin ? "SUPER_ADMIN" : role,
        roleTitle: isSuperAdmin ? "Super Administrator" : "Citizen User",
        permissions: {},
      };
    }
    return null;
  }, [meQuery.data, isSignedIn, clerkUser]);

  const state = useMemo(
    () => ({
      user: effectiveUser,
      clerkUser,
      loading:
        !isLoaded || (Boolean(isSignedIn) && meQuery.isLoading && !effectiveUser),
      error: meQuery.error ?? null,
      isAuthenticated: Boolean(isSignedIn && effectiveUser),
      isSignedIn: Boolean(isSignedIn),
    }),
    [
      clerkUser,
      effectiveUser,
      isLoaded,
      isSignedIn,
      meQuery.error,
      meQuery.isLoading,
    ]
  );

  useEffect(() => {
    if (!redirectOnUnauthenticated || !isLoaded || isSignedIn) return;
    if (window.location.pathname === redirectPath) return;
    window.location.assign(redirectPath);
  }, [isLoaded, isSignedIn, redirectOnUnauthenticated, redirectPath]);

  return {
    ...state,
    refresh: () => meQuery.refetch(),
    logout,
  };
}
