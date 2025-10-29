"use client";
import { Button } from "@/components/ui/button";
import React, { useState } from "react";
import { FaStar } from "react-icons/fa6";
import { Textarea } from "@/components/ui/textarea";
import { useReviews } from "@/hooks/useReviews";
import { ListingType } from "@/types/listings";
import {
  CreateReviewInput,
  frontendTypeToCollectionSlug,
} from "@/lib/api/reviews";
import { useForm } from "react-hook-form";
import { useSession } from "next-auth/react";

const ReviewForm = ({
  type,
  listingId,
}: {
  type: ListingType;
  listingId: number;
}) => {
  const { data: session } = useSession();
  const user = session?.user;
  const { addReview, isAdding } = useReviews({ type, listingId });
  const [showReviewForm, setShowReviewForm] = useState(false);

  const { register, handleSubmit, setValue, watch, reset } =
    useForm<CreateReviewInput>({
      defaultValues: {
        rating: 0,
        comment: "",
      },
    });
  const rating = watch("rating");

  const handleOnSubmit = (data: CreateReviewInput) => {
    console.log(data);
    addReview({
      listingType: frontendTypeToCollectionSlug(type),
      listingId,
      rating: data.rating,
      comment: data.comment,
      // criteriaRatings: data.criteriaRatings,
    });
    reset();
  };

  if (!user) {
    return (
      <div className="p-4 rounded-lg border border-border space-y-4">
        <p className="text-sm text-muted-foreground">
          Pentru a putea lasa o recenzie, trebuie sa te autentifici.
        </p>
      </div>
    );
  }

  if (!showReviewForm) {
    return (
      <Button
        onClick={() => setShowReviewForm(true)}
        variant="outline"
        className="w-full"
      >
        Lasă o evaluare
      </Button>
    );
  }
  return (
    <div className="p-4 rounded-lg border border-border space-y-4">
      <h3 className="font-semibold">Adaugă o recenzie</h3>

      {/* Star rating */}
      <form onSubmit={handleSubmit(handleOnSubmit)}>
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">Rating</p>
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                type="button"
                key={star}
                onClick={() => setValue("rating", star)}
                className="hover:scale-110 transition-transform"
                aria-label={`${star} stele`}
              >
                <FaStar
                  className={`h-6 w-6 ${star <= rating ? "text-yellow-500" : "text-muted"}`}
                />
              </button>
            ))}
          </div>
        </div>

        {/* Comment */}
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">Comentariu</p>
          <Textarea
            placeholder="Scrie recenzia ta aici..."
            className="min-h-[100px]"
            {...register("comment")}
          />
        </div>

        <div className="flex gap-2">
          <Button className="flex-1" disabled={isAdding}>
            {isAdding ? "Se publică recenzia..." : "Publică recenzia"}
          </Button>
          <Button
            variant="outline"
            onClick={() => setShowReviewForm(false)}
            disabled={isAdding}
          >
            Anulează
          </Button>
        </div>
      </form>
      <p className="text-xs text-muted-foreground">
        Recenziile sunt moderate conform{" "}
        <a href="/politica-de-confidentialitate" className="underline">
          politicii noastre
        </a>
        .
      </p>
    </div>
  );
};

export default ReviewForm;
