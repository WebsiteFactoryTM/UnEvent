"use client";

import { useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { useAssociateClaim } from "@/lib/react-query/claims.queries";

/**
 * Component to handle claim token association after user login/signup
 * Checks for claimToken in URL params or localStorage and associates it with user profile
 */
export function ClaimTokenHandler() {
  const { data: session, status } = useSession();
  const searchParams = useSearchParams();
  const associateClaimMutation = useAssociateClaim();
  const hasAttemptedRef = useRef(false); // Prevent multiple attempts

  useEffect(() => {
    // Only proceed if user is authenticated
    if (status !== "authenticated" || !session?.user) {
      return;
    }

    // Prevent multiple attempts
    if (hasAttemptedRef.current) {
      return;
    }

    // Get claimToken from URL params or localStorage
    const claimTokenFromUrl = searchParams.get("claimToken");
    const claimTokenFromStorage = localStorage.getItem("claimToken");
    const claimToken = claimTokenFromUrl || claimTokenFromStorage;

    if (!claimToken) {
      return;
    }

    // Mark as attempted to prevent retries
    hasAttemptedRef.current = true;

    // Associate the claim with the user's profile
    associateClaimMutation.mutate(claimToken, {
      onSuccess: () => {
        // Clean up URL param if present
        if (claimTokenFromUrl) {
          const url = new URL(window.location.href);
          url.searchParams.delete("claimToken");
          window.history.replaceState({}, "", url.toString());
        }
        // Clean up localStorage
        localStorage.removeItem("claimToken");
      },
      onError: () => {
        // On error, also clean up to prevent retries
        localStorage.removeItem("claimToken");
        // Reset the ref after a delay to allow retry on page refresh if needed
        setTimeout(() => {
          hasAttemptedRef.current = false;
        }, 5000);
      },
    });
  }, [status, session, searchParams, associateClaimMutation]);

  return null; // This component doesn't render anything
}
