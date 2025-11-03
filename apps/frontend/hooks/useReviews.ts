"use client";

import { useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import type { Review } from "@/types/payload-types";

import {
  createReview,
  fetchReviews,
  frontendTypeToCollectionSlug,
  type CreateReviewInput,
  type ListingCollectionSlug,
  type PaginatedResult,
} from "@/lib/api/reviews";
import { reviewsKeys } from "@/lib/cacheKeys";
import { ListingType } from "@/types/listings";

function toCollectionSlug(type: ListingType): ListingCollectionSlug {
  return frontendTypeToCollectionSlug(type);
}

// Keys are centralized in reviews.keys

export interface UseReviewsOptions {
  page?: number;
  limit?: number;
  status?: "approved" | "pending" | "rejected";
}

export function useReviews(
  args: { type: ListingType; listingId: number | null } & UseReviewsOptions,
) {
  const { type, listingId, page = 1, limit = 10, status = "approved" } = args;
  const collectionSlug = useMemo(() => toCollectionSlug(type), [type]);
  const { data: session } = useSession();
  const queryClient = useQueryClient();

  const queryKey = useMemo(
    () =>
      listingId != null
        ? reviewsKeys.list(collectionSlug, listingId, { page, limit, status })
        : (["reviews", collectionSlug, null, { page, limit, status }] as const),
    [collectionSlug, listingId, page, limit, status],
  );

  const query = useQuery<PaginatedResult<Review>, Error>({
    queryKey,
    enabled: Boolean(listingId),
    queryFn: () =>
      fetchReviews({
        listingId: listingId as number,
        listingType: collectionSlug,
        page,
        limit,
        status,
      }),
    // staleTime: 0,
    gcTime: 1000 * 60 * 5,
  });

  // Local flag to reflect that the current viewer has submitted a review for this listing
  const userSubmittedKey = useMemo(
    () =>
      listingId != null
        ? ["reviews", "user-submitted", collectionSlug, listingId]
        : null,
    [collectionSlug, listingId],
  );

  const mutation = useMutation<
    Review,
    Error,
    Omit<CreateReviewInput, "listingType"> & {
      listingType?: ListingCollectionSlug;
    }
  >({
    mutationFn: (input) =>
      createReview(
        {
          listingId: input.listingId,
          listingType: input.listingType ?? collectionSlug,
          rating: input.rating,
          comment: input.comment,
          criteriaRatings: input.criteriaRatings,
        },
        (session as any)?.accessToken,
      ),
    onSuccess: async () => {
      if (listingId != null) {
        // Mark locally that the user has submitted a review for this listing
        if (userSubmittedKey) {
          queryClient.setQueryData<boolean>(userSubmittedKey, true);
        }
        await queryClient.invalidateQueries({
          queryKey: reviewsKeys.listing(collectionSlug, listingId),
          exact: false,
        });
      }
    },
  });

  // Derive hasUserReview from local flag or, if available, from fetched reviews matching viewer (best-effort)
  const hasUserReview = useMemo(() => {
    if (userSubmittedKey) {
      const local = queryClient.getQueryData<boolean>(userSubmittedKey);
      if (local) return true;
    }
    // Best-effort: if the fetched reviews include one by the same user profile, mark true
    // Note: session.user.id is the User ID; Reviews.user relates to Profile, so this may not always match.
    // We keep this conservative and rely primarily on the local flag above after submission.
    return false;
  }, [queryClient, userSubmittedKey]);

  return {
    reviews: query.data?.docs ?? [],
    total: query.data?.totalDocs ?? 0,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    error: query.error,
    refetch: query.refetch,
    addReview: mutation.mutate,
    addReviewAsync: mutation.mutateAsync,
    isAdding: mutation.isPending,
    hasUserReview,
  };
}
