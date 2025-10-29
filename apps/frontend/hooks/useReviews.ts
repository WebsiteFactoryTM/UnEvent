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
import { ListingType } from "@/types/listings";

function toCollectionSlug(type: ListingType): ListingCollectionSlug {
  return frontendTypeToCollectionSlug(type);
}

function getQueryKey(
  listingType: ListingCollectionSlug,
  listingId: number | null,
  page: number,
  limit: number,
  status: "approved" | "pending" | "rejected",
) {
  return ["reviews", listingType, listingId, { page, limit, status }];
}

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
    () => getQueryKey(collectionSlug, listingId, page, limit, status),
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
    staleTime: 0,
    gcTime: 1000 * 60 * 5,
  });

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
      // Invalidate all review queries for this listing (any page/limit/status)
      if (listingId != null) {
        await queryClient.invalidateQueries({
          queryKey: ["reviews", collectionSlug, listingId],
          exact: false,
        });
      } else {
        await queryClient.invalidateQueries({ queryKey, exact: true });
      }
    },
  });

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
  };
}
