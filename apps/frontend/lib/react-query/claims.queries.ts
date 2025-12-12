import { useMutation, useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import type { Claim } from "@/types/payload-types";

interface CreateClaimData {
  listingId: number;
  listingType: "locations" | "events" | "services";
  claimantEmail: string;
  claimantName?: string;
  claimantPhone?: string;
}

interface CreateClaimResponse {
  success: boolean;
  claimId: number;
  claimToken: string;
  profileId: number | null;
}

interface ClaimByTokenResponse {
  success: boolean;
  claim: {
    id: number;
    claimToken: string;
    listing: number | { relationTo: string; value: number };
    listingType: string;
    claimantEmail: string;
    status: "pending" | "approved" | "rejected";
  };
}

/**
 * Create a new claim for a listing
 */
async function createClaim(
  data: CreateClaimData,
): Promise<CreateClaimResponse> {
  const response = await fetch("/api/claims", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to create claim");
  }

  return response.json();
}

/**
 * Get claim by token
 */
async function getClaimByToken(token: string): Promise<ClaimByTokenResponse> {
  const response = await fetch(`/api/claims/token/${token}`);

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to fetch claim");
  }

  return response.json();
}

/**
 * Associate a claim with user profile (after signup/login)
 */
async function associateClaim(token: string): Promise<ClaimByTokenResponse> {
  const response = await fetch(`/api/claims/token/${token}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to associate claim");
  }

  return response.json();
}

/**
 * Hook to create a claim
 */
export function useCreateClaim(options?: {
  onSuccess?: (data: CreateClaimResponse) => void;
}) {
  const { toast } = useToast();

  return useMutation({
    mutationFn: createClaim,
    onSuccess: (data) => {
      toast({
        title: "Cerere trimisă",
        description:
          "Cererea ta de revendicare a fost trimisă cu succes. Vei primi un email când va fi aprobată.",
      });

      // Call custom success handler if provided (component handles redirects)
      if (options?.onSuccess) {
        options.onSuccess(data);
      }
    },
    onError: (error: Error) => {
      toast({
        title: "Eroare",
        description: error.message.includes("already exists")
          ? "Ai trimis deja o cerere de revendicare pentru această listare."
          : "A apărut o eroare. Te rugăm să încerci din nou.",
        variant: "destructive",
      });
    },
  });
}

/**
 * Hook to get claim by token
 */
export function useClaimByToken(token: string | null) {
  return useQuery({
    queryKey: ["claim", token],
    queryFn: () => getClaimByToken(token!),
    enabled: !!token,
  });
}

/**
 * Hook to associate claim with user profile
 */
export function useAssociateClaim() {
  const { toast } = useToast();

  return useMutation({
    mutationFn: associateClaim,
    onSuccess: () => {
      toast({
        title: "Succes",
        description: "Cererea ta de revendicare a fost asociată cu contul tău.",
      });
      // Clear claim token from localStorage
      localStorage.removeItem("claimToken");
    },
    onError: (error: Error) => {
      toast({
        title: "Eroare",
        description:
          error.message || "Nu s-a putut asocia cererea cu contul tău.",
        variant: "destructive",
      });
    },
  });
}

/**
 * Fetch user's claims filtered by listing type
 */
async function getUserClaims(
  listingType: "locations" | "events" | "services" | null,
  accessToken: string,
): Promise<Claim[]> {
  const params = new URLSearchParams();
  if (listingType) {
    params.append("listingType", listingType);
  }

  const response = await fetch(`/api/claims/my-claims?${params.toString()}`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to fetch claims");
  }

  const data = await response.json();
  return data.claims || [];
}

/**
 * Hook to get user's claims
 */
export function useUserClaims(
  listingType: "locations" | "events" | "services" | null = null,
) {
  const { data: session } = useSession();
  const accessToken = session?.accessToken;

  return useQuery({
    queryKey: ["claims", "user", listingType],
    queryFn: () => getUserClaims(listingType, accessToken!),
    enabled: !!accessToken,
  });
}
