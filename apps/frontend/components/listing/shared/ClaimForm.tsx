"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { FormField } from "@/components/ui/form-field";
import { useCreateClaim } from "@/lib/react-query/claims.queries";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle2, Info } from "lucide-react";
import type { ListingType } from "@/types/listings";
import { useState } from "react";

const claimFormSchema = z.object({
  email: z
    .string()
    .min(1, "Email-ul este obligatoriu.")
    .email("Te rugăm să introduci o adresă de email validă."),
  name: z.string().optional(),
  phone: z.string().optional(),
});

type ClaimFormData = z.infer<typeof claimFormSchema>;

interface ClaimFormProps {
  listingId: number;
  listingType: ListingType;
  onSuccess?: () => void;
  initialEmail?: string;
  isPageForm?: boolean;
  listingSlug?: string;
  listingTypeSlug?: string;
}

export function ClaimForm({
  listingId,
  listingType,
  onSuccess,
  initialEmail,
  isPageForm = false,
  listingSlug,
  listingTypeSlug,
}: ClaimFormProps) {
  const router = useRouter();
  const { data: session } = useSession();
  const [isSuccess, setIsSuccess] = useState(false);
  const [submittedEmail, setSubmittedEmail] = useState<string | null>(null);

  const createClaimMutation = useCreateClaim({
    onSuccess: async (data) => {
      setIsSuccess(true);

      // Handle redirect logic for both dialog and page forms
      if (!session?.user && data.claimToken) {
        // If not authenticated, check if email exists to redirect to login or signup
        localStorage.setItem("claimToken", data.claimToken);

        // Check if email exists (use stored email from form submission)
        if (submittedEmail) {
          try {
            const checkResponse = await fetch(
              `/api/users/check-email?email=${encodeURIComponent(submittedEmail)}`,
            );
            if (checkResponse.ok) {
              const { exists } = await checkResponse.json();
              const authPath = exists
                ? `/auth/autentificare`
                : `/auth/inregistrare`;
              const redirectUrl = `${authPath}?claimToken=${data.claimToken}&email=${encodeURIComponent(submittedEmail)}`;

              // For dialog, close it first, then redirect
              if (onSuccess) {
                onSuccess(); // Close dialog
                setTimeout(() => {
                  router.push(redirectUrl);
                }, 300); // Small delay to allow dialog to close
              } else if (isPageForm && listingSlug && listingTypeSlug) {
                // For page form, redirect after delay
                setTimeout(() => {
                  router.push(redirectUrl);
                }, 2000);
              }
              return;
            }
          } catch (error) {
            console.error("[ClaimForm] Error checking email:", error);
            // Fallback to signup if check fails
          }
        }

        // Fallback: redirect to signup if email check fails or no email stored
        const redirectUrl = `/auth/inregistrare?claimToken=${data.claimToken}${submittedEmail ? `&email=${encodeURIComponent(submittedEmail)}` : ""}`;
        if (onSuccess) {
          onSuccess(); // Close dialog
          setTimeout(() => {
            router.push(redirectUrl);
          }, 300);
        } else if (isPageForm && listingSlug && listingTypeSlug) {
          setTimeout(() => {
            router.push(redirectUrl);
          }, 2000);
        }
      } else if (session?.user) {
        // If authenticated, redirect to listing (both dialog and page form)
        if (listingSlug && listingTypeSlug) {
          if (onSuccess) {
            onSuccess(); // Close dialog first
          }
          setTimeout(
            () => {
              router.push(`/${listingTypeSlug}/${listingSlug}`);
            },
            onSuccess ? 300 : 2000,
          ); // Shorter delay for dialog (already closing)
        } else if (onSuccess) {
          // Fallback: just close dialog if no slug info
          onSuccess();
        }
      } else if (onSuccess) {
        // Fallback: just close dialog if no redirect needed
        onSuccess();
      }
    },
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ClaimFormData>({
    resolver: zodResolver(claimFormSchema),
    defaultValues: {
      email: initialEmail || "",
      name: "",
      phone: "",
    },
  });

  const onSubmit = async (data: ClaimFormData) => {
    // Store email for redirect logic
    setSubmittedEmail(data.email);

    // Map frontend listing type to backend collection slug
    const listingTypeMap: Record<
      ListingType,
      "locations" | "events" | "services"
    > = {
      locatii: "locations",
      servicii: "services",
      evenimente: "events",
    };

    const backendListingType = listingTypeMap[listingType];

    createClaimMutation.mutate({
      listingId,
      listingType: backendListingType,
      claimantEmail: data.email,
      claimantName: data.name || undefined,
      claimantPhone: data.phone || undefined,
    });
  };

  // Show success state
  if (isSuccess) {
    return (
      <Alert className="border-green-500/50 bg-green-500/10">
        <CheckCircle2 className="h-4 w-4 text-green-500" />
        <AlertDescription className="space-y-2">
          <p className="font-semibold text-green-500">
            Cererea ta de revendicare a fost trimisă cu succes!
          </p>
          <p className="text-sm">
            Vei primi un email când cererea ta va fi aprobată. Te redirecționăm
            către listare...
          </p>
        </AlertDescription>
      </Alert>
    );
  }

  const isAuthenticated = !!session?.user;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {/* Instructions */}
      <Alert className="border-blue-500/50 bg-blue-500/10">
        <Info className="h-4 w-4 text-blue-500" />
        <AlertDescription className="space-y-2 text-sm">
          <p className="font-semibold text-blue-500">
            Cum funcționează procesul:
          </p>
          <ol className="list-decimal list-inside space-y-1 text-muted-foreground ml-2">
            <li>Completează formularul de mai jos cu datele tale de contact</li>
            {!isAuthenticated && (
              <li>
                După trimitere, vei fi redirecționat către crearea unui cont sau
                te poți autentifica dacă ai deja cont
              </li>
            )}
            <li>Cererea ta va fi trimisă pentru aprobare echipei UN:EVENT</li>
            <li>
              Vei primi un email când cererea ta va fi aprobată sau respinsă
            </li>
            <li>
              După aprobare, listarea va deveni a ta și o vei putea gestiona din
              contul tău
            </li>
          </ol>
        </AlertDescription>
      </Alert>

      <FormField label="Email" error={errors.email?.message} required>
        <Input
          type="email"
          placeholder="email@example.com"
          {...register("email")}
          aria-invalid={errors.email ? "true" : "false"}
          disabled={createClaimMutation.isPending}
        />
      </FormField>

      <FormField label="Nume (opțional)" error={errors.name?.message}>
        <Input
          type="text"
          placeholder="Numele tău complet"
          {...register("name")}
          aria-invalid={errors.name ? "true" : "false"}
          disabled={createClaimMutation.isPending}
        />
      </FormField>

      <FormField label="Telefon (opțional)" error={errors.phone?.message}>
        <Input
          type="tel"
          placeholder="+40712345678"
          {...register("phone")}
          aria-invalid={errors.phone ? "true" : "false"}
          disabled={createClaimMutation.isPending}
        />
      </FormField>

      <Button
        type="submit"
        className="w-full"
        disabled={createClaimMutation.isPending}
      >
        {createClaimMutation.isPending ? "Se trimite..." : "Revendică listarea"}
      </Button>
    </form>
  );
}
