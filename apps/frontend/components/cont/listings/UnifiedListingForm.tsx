"use client";

import { useState } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ZodError } from "zod";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, FileText, Send } from "lucide-react";
import {
  unifiedListingSchema,
  defaultListingFormValues,
  type UnifiedListingFormData,
} from "@/forms/listing/schema";
import { ContactTab } from "@/components/cont/shared/tabs/ContactTab";
import { AddressTab } from "@/components/cont/shared/tabs/AddressTab";
import { ImagesTab } from "@/components/cont/shared/tabs/ImagesTab";
import { FacilitiesTab } from "@/components/cont/locations/tabs/FacilitiesTab";
import { InfoTab as LocationInfoTab } from "@/components/cont/locations/tabs/InfoTab";
import { InfoTab as ServiceInfoTab } from "@/components/cont/services/tabs/InfoTab";
import { InfoTab as EventInfoTab } from "@/components/cont/events/tabs/InfoTab";
import { ScheduleTab } from "@/components/cont/events/tabs/ScheduleTab";
import {
  payloadToForm,
  formToPayload,
} from "@/lib/transforms/listingFormTransform";
import { useListingsManager } from "@/lib/react-query/accountListings.queries";
import { useToast } from "@/hooks/use-toast";
import type { Location, Event, Service } from "@/types/payload-types";
import type { ListingType } from "@/types/listings";

interface UnifiedListingFormProps {
  listingType: "location" | "service" | "event";
  editMode?: boolean;
  existingListing?: Location | Event | Service;
  onSuccess?: (listing: Location | Event | Service) => void;
}

// Helper to map form listingType to hook ListingType
function mapListingTypeToHookType(
  listingType: "location" | "service" | "event",
): ListingType {
  const mapping: Record<"location" | "service" | "event", ListingType> = {
    location: "locatii",
    service: "servicii",
    event: "evenimente",
  };
  return mapping[listingType];
}

export function UnifiedListingForm({
  listingType,
  editMode = false,
  existingListing,
  onSuccess,
}: UnifiedListingFormProps) {
  const [activeTab, setActiveTab] = useState("info");
  const [savedListingId, setSavedListingId] = useState<number | undefined>(
    existingListing?.id,
  );
  const { toast } = useToast();
  const { data: session } = useSession();
  const router = useRouter();

  // Use React Query hook for mutations
  const hookListingType = mapListingTypeToHookType(listingType);
  const profileId = session?.user?.profile as number;
  const accessToken = session?.accessToken;

  const {
    createListing: createListingMutation,
    updateListing: updateListingMutation,
    isCreating,
    isUpdating,
  } = useListingsManager({
    type: hookListingType,
    profileId: profileId || 0,
    accessToken: accessToken || "",
  });

  const isSubmitting = isCreating || isUpdating;

  // Guard: ensure we have required auth data before allowing mutations
  const canSubmit = !!profileId && !!accessToken;

  // Define tabs based on listing type
  const tabs = [
    { value: "info", label: "Informații" },
    { value: "address", label: "Adresă" },
    ...(listingType === "location"
      ? [{ value: "facilities", label: "Facilități" }]
      : []),
    { value: "images", label: "Imagini" },
    ...(listingType === "event"
      ? [{ value: "schedule", label: "Program" }]
      : []),
    { value: "contact", label: "Contact" },
  ];

  // Initialize form with default or existing values
  const defaultValues =
    editMode && existingListing
      ? payloadToForm(existingListing, listingType)
      : defaultListingFormValues(listingType);

  const methods = useForm<UnifiedListingFormData>({
    resolver: zodResolver(unifiedListingSchema) as any,
    defaultValues: defaultValues as any,
    mode: "onChange",
  });

  const {
    handleSubmit,
    formState: { errors },
    setError,
    clearErrors,
    trigger,
  } = methods;

  const currentTabIndex = tabs.findIndex((tab) => tab.value === activeTab);
  const isFirstTab = currentTabIndex === 0;
  const isLastTab = currentTabIndex === tabs.length - 1;

  const handleNext = (e?: React.MouseEvent | React.KeyboardEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (!isLastTab) {
      setActiveTab(tabs[currentTabIndex + 1].value);
    }
  };

  const handlePrevious = () => {
    if (!isFirstTab) {
      setActiveTab(tabs[currentTabIndex - 1].value);
    }
  };

  const handleSaveDraft = async () => {
    if (!canSubmit) {
      toast({
        title: "Eroare",
        description: "Sesiunea a expirat. Te rugăm să te autentifici din nou.",
        variant: "destructive",
      });
      return;
    }

    const formData = methods.getValues();

    // Set status to draft
    methods.setValue("moderationStatus", "draft");

    try {
      const payload = formToPayload({
        ...formData,
        moderationStatus: "draft",
        _status: "draft",
      } as UnifiedListingFormData);

      let result;
      if (editMode || savedListingId) {
        // Update existing listing
        result = await updateListingMutation({
          id: savedListingId!,
          data: payload as any,
        });
      } else {
        // Create new listing
        result = await createListingMutation(payload as any);
        setSavedListingId(result.id);
      }

      toast({
        title: "Ciornă salvată",
        description:
          "Modificările au fost salvate ca ciornă. Poți continua mai târziu.",
      });
    } catch (error) {
      console.error(error);
      toast({
        title: "Eroare",
        description: "Nu s-a putut salva ciornaș.",
        variant: "destructive",
      });
    }
  };

  const onSubmit = async (data: UnifiedListingFormData) => {
    if (!canSubmit) {
      toast({
        title: "Eroare",
        description: "Sesiunea a expirat. Te rugăm să te autentifici din nou.",
        variant: "destructive",
      });
      return;
    }

    // Clear previous errors
    clearErrors();

    // Validate with status="pending" to check all submission requirements
    const submissionData = {
      ...data,
      _status: "published" as const,
      moderationStatus: "pending" as const,
    };

    try {
      // Validate the submission data
      await unifiedListingSchema.parseAsync(submissionData);
    } catch (error) {
      // If validation fails, set errors on the form
      const errorFields: string[] = [];
      if (error instanceof ZodError) {
        console.log("Validation errors:", error.errors); // Debug logging
        error.errors.forEach((err) => {
          console.log("Processing error:", err.path, err.message); // Debug logging
          const fieldPath = err.path.join(".") as any;
          // Get the root field name (first part of path) for tab navigation
          const rootField = err.path[0] as string;
          if (rootField && !errorFields.includes(rootField)) {
            errorFields.push(rootField);
          }
          console.log("Setting error on field:", fieldPath); // Debug logging
          setError(fieldPath, {
            type: "validation",
            message: err.message,
          });
        });

        // Force form re-validation to ensure errors are displayed
        setTimeout(() => trigger(), 0);
      }

      // Show error toast and navigate to first error tab
      handleError(errorFields);
      return;
    }

    try {
      // Validation passed, proceed with submission
      const payload = formToPayload(submissionData);

      let result;
      if (editMode || savedListingId) {
        // Update existing listing
        result = await updateListingMutation({
          id: savedListingId!,
          data: payload as any,
        });
      } else {
        // Create new listing
        result = await createListingMutation(payload as any);
        setSavedListingId(result.id);
      }

      toast({
        title: "Succes!",
        description: `${
          listingType === "location"
            ? "Locația"
            : listingType === "service"
              ? "Serviciul"
              : "Evenimentul"
        } a fost trimis spre aprobare.`,
      });

      if (onSuccess) {
        onSuccess(result);
      } else {
        // Redirect to listings page
        router.push(
          `/cont/${
            listingType === "location"
              ? "locatiile-mele"
              : listingType === "service"
                ? "serviciile-mele"
                : "evenimentele-mele"
          }`,
        );
      }
    } catch (error) {
      console.error(error);
      toast({
        title: "Eroare",
        description: "Nu s-a putut trimite spre aprobare.",
        variant: "destructive",
      });
    }
  };

  // Helper function to navigate to first error tab
  const navigateToErrorTab = (errorFields: string[]) => {
    if (errorFields.length > 0) {
      const fieldToTab: Record<string, string> = {
        title: "info",
        type: listingType === "service" ? "services" : "info",
        suitableFor: "info",
        description: "info",
        capacity: "info",
        surface: "info",
        pricing: "info",
        city: "address",
        address: "address",
        geo: "address",
        facilities: "facilities",
        featuredImage: "images",
        gallery: "images",
        youtubeLinks: "images",
        allDayEvent: "schedule",
        startDate: "schedule",
        startTime: "schedule",
        endDate: "schedule",
        endTime: "schedule",
        contact: "contact",
        socialLinks: "contact",
      };

      const firstErrorField = errorFields[0];
      const targetTab = fieldToTab[firstErrorField] || "info";
      setActiveTab(targetTab);
    }
  };

  const handleError = (errorFields?: string[]) => {
    toast({
      title: "Validare incompletă",
      description:
        "Te rugăm să completezi toate câmpurile obligatorii și să corectezi erorile.",
      variant: "destructive",
    });

    // Navigate to first tab with errors
    // Use provided errorFields or fall back to formState errors
    const fieldsToCheck = errorFields || Object.keys(errors);
    navigateToErrorTab(fieldsToCheck);
  };

  // Error handler for react-hook-form's handleSubmit
  const onFormError = (formErrors: any) => {
    // Extract error field names from react-hook-form errors
    const extractErrorFields = (errors: any, prefix = ""): string[] => {
      const fields: string[] = [];
      for (const [key, value] of Object.entries(errors)) {
        const fieldPath = prefix ? `${prefix}.${key}` : key;
        if (value && typeof value === "object" && "message" in value) {
          fields.push(fieldPath);
        } else if (value && typeof value === "object") {
          fields.push(...extractErrorFields(value, fieldPath));
        }
      }
      return fields;
    };

    const errorFields = extractErrorFields(formErrors);
    handleError(errorFields);
  };

  return (
    <FormProvider {...methods}>
      <form
        onSubmit={handleSubmit(onSubmit as any, onFormError)}
        onKeyDown={(e) => {
          // Prevent form submission on Enter key unless on last tab
          if (
            e.key === "Enter" &&
            !isLastTab &&
            e.target instanceof HTMLElement &&
            e.target.tagName !== "TEXTAREA"
          ) {
            handleNext(e);
          }
        }}
        className="flex flex-col"
      >
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="flex-1 flex flex-col"
        >
          <div className="border-b bg-background">
            <div className="container mx-auto px-4 sm:px-6 lg:px-4">
              <TabsList
                className="grid w-full h-auto"
                style={{
                  gridTemplateColumns: `repeat(${tabs.length}, minmax(0, 1fr))`,
                }}
              >
                {tabs.map((tab) => (
                  <TabsTrigger
                    key={tab.value}
                    value={tab.value}
                    className="text-xs sm:text-sm px-2 py-2"
                  >
                    {tab.label}
                  </TabsTrigger>
                ))}
              </TabsList>
            </div>
          </div>

          <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 max-w-4xl">
            <TabsContent value="info" className="mt-0 space-y-6">
              {listingType === "location" && <LocationInfoTab />}
              {listingType === "service" && <ServiceInfoTab />}
              {listingType === "event" && <EventInfoTab />}
            </TabsContent>

            <TabsContent value="address" className="mt-0 space-y-6">
              <AddressTab />
            </TabsContent>

            {listingType === "location" && (
              <TabsContent value="facilities" className="mt-0 space-y-6">
                <FacilitiesTab />
              </TabsContent>
            )}

            <TabsContent value="images" className="mt-0 space-y-6">
              <ImagesTab />
            </TabsContent>

            {listingType === "event" && (
              <TabsContent value="schedule" className="mt-0 space-y-6">
                <ScheduleTab />
              </TabsContent>
            )}

            <TabsContent value="contact" className="mt-0 space-y-6">
              <ContactTab />
            </TabsContent>
          </div>

          <div className="border-t bg-muted/30">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4">
              <div className="flex items-center justify-between gap-2 sm:gap-3 max-w-4xl mx-auto">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handlePrevious}
                  disabled={isFirstTab || isSubmitting}
                  className="gap-1 sm:gap-2 text-sm h-9"
                >
                  <ChevronLeft className="h-4 w-4" />
                  <span className="hidden sm:inline">Înapoi</span>
                </Button>

                <div className="flex items-center gap-2 sm:gap-3">
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={handleSaveDraft}
                    disabled={!canSubmit || isSubmitting}
                    className="gap-1 sm:gap-2 text-sm h-9"
                  >
                    <FileText className="h-4 w-4" />
                    <span className="hidden md:inline">Salvează ca ciornă</span>
                    <span className="md:hidden">Ciornă</span>
                  </Button>

                  <div className="text-xs sm:text-sm text-muted-foreground whitespace-nowrap">
                    <span className="hidden sm:inline">Pas </span>
                    {currentTabIndex + 1}/{tabs.length}
                  </div>
                </div>

                {isLastTab ? (
                  <Button
                    type="submit"
                    disabled={!canSubmit || isSubmitting}
                    className="gap-1 sm:gap-2 text-sm h-9"
                  >
                    <Send className="h-4 w-4" />
                    <span className="hidden sm:inline">
                      Trimite spre aprobare
                    </span>
                    <span className="sm:hidden">Trimite</span>
                  </Button>
                ) : (
                  <Button
                    type="button"
                    onClick={(e) => handleNext(e)}
                    disabled={isSubmitting}
                    className="gap-1 sm:gap-2 text-sm h-9"
                  >
                    <span className="hidden sm:inline">Următorul</span>
                    <span className="sm:hidden">Next</span>
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          </div>
        </Tabs>
      </form>
    </FormProvider>
  );
}
