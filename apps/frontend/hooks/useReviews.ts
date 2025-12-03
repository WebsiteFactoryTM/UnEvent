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

  // Get user's profile ID
  const userProfileId = useMemo(() => {
    if (!session?.user?.profile) return null;
    return typeof session.user.profile === "number"
      ? session.user.profile
      : null;
  }, [session?.user?.profile]);

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
        // Invalidate all review queries for this listing
        await queryClient.invalidateQueries({
          queryKey: reviewsKeys.listing(collectionSlug, listingId),
          exact: false,
        });
        // Invalidate pending review query if it exists
        if (pendingReviewQueryKey) {
          await queryClient.invalidateQueries({
            queryKey: pendingReviewQueryKey,
            exact: true,
          });
        }
      }
    },
  });

  // Fetch user's pending review separately (only if authenticated and listingId exists)
  const pendingReviewQueryKey = useMemo(
    () =>
      listingId != null && userProfileId != null
        ? ([
            "reviews",
            "pending",
            collectionSlug,
            listingId,
            userProfileId,
          ] as const)
        : null,
    [collectionSlug, listingId, userProfileId],
  );

  const pendingReviewQuery = useQuery<PaginatedResult<Review>, Error>({
    queryKey: pendingReviewQueryKey ?? ["reviews", "pending", "disabled"],
    enabled: Boolean(listingId && userProfileId),
    queryFn: () =>
      fetchReviews({
        listingId: listingId as number,
        listingType: collectionSlug,
        page: 1,
        limit: 1,
        status: "pending",
        userId: userProfileId as number,
      }),
    gcTime: 1000 * 60 * 5,
  });

  const userPendingReview = useMemo(() => {
    if (
      !pendingReviewQuery.data?.docs ||
      pendingReviewQuery.data.docs.length === 0
    ) {
      return null;
    }
    return pendingReviewQuery.data.docs[0];
  }, [pendingReviewQuery.data]);

  // Derive hasUserReview from local flag, pending review, or approved reviews
  const hasUserReview = useMemo(() => {
    if (userSubmittedKey) {
      const local = queryClient.getQueryData<boolean>(userSubmittedKey);
      if (local) return true;
    }
    // Check if user has a pending review
    if (userPendingReview) return true;
    // Check if user has an approved review in the current list
    if (userProfileId && query.data?.docs) {
      const userReview = query.data.docs.find((review) => {
        const reviewUserId =
          typeof review.user === "object" ? review.user.id : review.user;
        return reviewUserId === userProfileId;
      });
      if (userReview) return true;
    }
    return false;
  }, [
    queryClient,
    userSubmittedKey,
    userPendingReview,
    userProfileId,
    query.data?.docs,
  ]);

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
    userPendingReview,
  };
}
