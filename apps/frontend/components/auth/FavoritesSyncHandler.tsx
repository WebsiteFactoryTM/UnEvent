"use client";

import { useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import {
  getAnonymousFavorites,
  clearAnonymousFavorites,
} from "@/lib/favorites/localStorage";

export function FavoritesSyncHandler() {
  const { data: session, status } = useSession();
  const queryClient = useQueryClient();
  const hasAttemptedRef = useRef(false); // CRITICAL: Prevents infinite loops

  const syncMutation = useMutation({
    mutationFn: async ({
      favorites,
      accessToken,
    }: {
      favorites: Array<{ entity: string; id: number }>;
      accessToken: string;
    }) => {
      const res = await fetch("/api/account/favorites/sync", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ favorites }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || "Sync failed");
      }
      return res.json();
    },
  });

  useEffect(() => {
    // Only proceed if authenticated
    if (status !== "authenticated" || !session?.user) {
      // CRITICAL: Reset flag when logged out
      hasAttemptedRef.current = false;
      return;
    }

    // CRITICAL: Prevent multiple attempts
    if (hasAttemptedRef.current) {
      return;
    }

    const favorites = getAnonymousFavorites();
    if (favorites.length === 0) {
      return;
    }

    // CRITICAL: Mark attempted BEFORE API call to prevent race conditions
    hasAttemptedRef.current = true;

    const accessToken = (session as any)?.accessToken;
    if (!accessToken) {
      // Reset if no token available
      hasAttemptedRef.current = false;
      return;
    }

    // Sync to backend
    syncMutation.mutate(
      {
        favorites: favorites.map((f) => ({ entity: f.entity, id: f.id })),
        accessToken,
      },
      {
        onSuccess: () => {
          // Clear localStorage
          clearAnonymousFavorites();

          // Invalidate ALL favorite-related caches
          queryClient.invalidateQueries({
            queryKey: ["favorites"],
            exact: false,
          });
        },
        onError: (error) => {
          console.error("Failed to sync favorites:", error);
          // Keep in localStorage for retry on next login
          // DON'T reset hasAttemptedRef - prevents infinite retries
        },
      },
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, session, queryClient]);

  return null;
}
