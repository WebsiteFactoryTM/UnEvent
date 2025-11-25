"use client";

import { useFormContext, useFieldArray } from "react-hook-form";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ImageIcon, Upload, X, Plus, Youtube, Loader2 } from "lucide-react";
import type { UnifiedListingFormData } from "@/forms/listing/schema";
import { useUploadManager, type UploadError } from "@/hooks/useUploadManager";
import { UploadInput } from "@/components/upload/UploadInput";
import { UploadPreview } from "@/components/upload/UploadPreview";
import { useSession } from "next-auth/react";

/**
 * Shared ImagesTab component for all listing types
 * Handles featured image, gallery, and YouTube links
 */
export function ImagesTab() {
  const {
    register,
    control,
    watch,
    setValue,
    formState: { errors },
  } = useFormContext<UnifiedListingFormData>();

  const { data: session } = useSession();
  const accessToken = session?.accessToken;

  const { fields, append, remove } = useFieldArray({
    control,
    name: "youtubeLinks",
  });

  const featuredImage = watch("featuredImage");
  const gallery = watch("gallery") || [];

  // Upload managers
  const featuredUM = useUploadManager({
    token: accessToken,
    accept: "image/*",
    maxSizeMB: 5,
  });
  const galleryUM = useUploadManager({
    token: accessToken,
    accept: "image/*",
    maxSizeMB: 5,
  });

  // Handle featured image upload (UI only)
  const handleFeaturedImageUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    featuredUM.handleSelect(e);
    try {
      const doc = await featuredUM.uploadSingle(file, "listing");
      // Store as {id, url} object
      if (doc.id && doc.url) {
        setValue(
          "featuredImage",
          { id: doc.id, url: doc.url },
          {
            shouldValidate: true,
            shouldDirty: true,
          },
        );
      }
    } catch (error) {
      // Error is already handled by useUploadManager and displayed via error state
      console.error("Error uploading featured image:", error);
    } finally {
      // featuredUM.clear();
    }
  };

  // Handle gallery upload (UI only)
  const handleGalleryUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    const currentGallery = Array.isArray(gallery) ? gallery : [];
    const remaining = 10 - currentGallery.length;
    const filesToAdd = files.slice(0, remaining);
    // Select for previews
    galleryUM.handleSelect({
      ...e,
      target: {
        ...e.target,
        files: ((): FileList => {
          // build a FileList-like object is complex; previews rely on internal state from handleSelect. We'll bypass by setting files directly.
          return e.target.files as FileList;
        })(),
      },
    } as React.ChangeEvent<HTMLInputElement>);
    // Upload all (with error handling per file)
    try {
      const results = await Promise.allSettled(
        filesToAdd.map((f) => galleryUM.uploadSingle(f, "listing")),
      );
      // Store only successful uploads as {id, url} objects
      const uploaded = results
        .filter((r) => r.status === "fulfilled")
        .map((r) => {
          const doc = (r as PromiseFulfilledResult<any>).value;
          return doc?.id && doc?.url ? { id: doc.id, url: doc.url } : null;
        })
        .filter((d): d is { id: number; url: string } => d !== null);

      if (uploaded.length > 0) {
        setValue("gallery", [...currentGallery, ...uploaded], {
          shouldValidate: true,
          shouldDirty: true,
        });
      }
    } catch (error) {
      // Error is already handled by useUploadManager and displayed via error state
      console.error("Error uploading gallery images:", error);
    }
  };

  // Remove featured image
  const handleRemoveFeaturedImage = () => {
    setValue("featuredImage", undefined, { shouldValidate: true });
    featuredUM.clear();
  };

  // Remove gallery image
  const handleRemoveGalleryImage = (index: number) => {
    const newGallery = (gallery || []).filter(
      (_: any, i: number) => i !== index,
    );
    setValue("gallery", newGallery, { shouldValidate: true });
    // also trim previews list if present
    if (galleryUM.previews?.length) {
      const copy = galleryUM.previews.slice();
      copy.splice(index, 1);
    }
  };

  // Format file size for display
  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="space-y-6">
      {/* Register hidden fields to ensure RHF tracks values set via setValue */}
      <input type="hidden" {...register("featuredImage")} />
      {/* Featured Image */}
      <div className="space-y-3">
        <Label className="required">Imagine principală</Label>
        <p className="text-sm text-muted-foreground">
          Aceasta va fi imaginea de copertă
        </p>

        <div className="border-2 border-dashed rounded-lg p-6 bg-muted/30 hover:bg-muted/50 transition-colors">
          {featuredUM.isUploading ? (
            <div className="flex flex-col items-center justify-center space-y-3 py-4">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <div className="text-center space-y-1">
                <p className="text-sm font-medium">Se încarcă imaginea...</p>
                <p className="text-xs text-muted-foreground">
                  {featuredUM.files?.[0]?.name || "Procesare..."}
                </p>
              </div>
            </div>
          ) : featuredImage ? (
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 bg-background rounded-lg">
                {/* Use URL from form state if available, fallback to upload manager preview */}
                {(featuredImage.url || featuredUM.previews?.[0]) && (
                  <img
                    src={featuredImage.url || featuredUM.previews?.[0]}
                    alt="Featured image preview"
                    className="h-10 w-10 rounded object-cover shrink-0"
                  />
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">
                    {featuredUM.files?.[0]?.name || "featured-image.jpg"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {featuredUM.files?.[0]?.size
                      ? formatFileSize(featuredUM.files[0].size)
                      : "N/A"}
                  </p>
                  {featuredImage.id && (
                    <p className="text-xs text-emerald-600">Încărcat</p>
                  )}
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleRemoveFeaturedImage}
                  className="shrink-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ) : (
            <UploadInput
              multiple={false}
              accept="image/jpeg,image/png,image/webp"
              onChange={handleFeaturedImageUpload}
            >
              <Upload className="h-10 w-10 text-muted-foreground" />
              <div className="text-center space-y-1">
                <p className="text-sm font-medium">
                  Click pentru a încărca imagine
                </p>
                <p className="text-xs text-muted-foreground">
                  Format: JPG, PNG, Webp • Max: 5MB • Recomandat: 1920x1080px
                </p>
              </div>
            </UploadInput>
          )}
        </div>

        {/* Upload-specific errors take priority over form validation errors */}
        {featuredUM.error && (
          <p className="text-sm text-destructive font-medium">
            {featuredUM.error.message}
          </p>
        )}
        {!featuredUM.error && errors.featuredImage && (
          <p className="text-sm text-destructive">
            {errors.featuredImage.message as string}
          </p>
        )}
      </div>

      <Separator />

      {/* Gallery */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <Label>Galerie imagini (opțional)</Label>
            <p className="text-sm text-muted-foreground">
              Până la 10 imagini suplimentare
            </p>
          </div>
          <Badge variant="secondary">{gallery.length || 0} / 10</Badge>
        </div>

        {gallery.length > 0 && (
          <div className="space-y-2">
            {gallery.map((item: { id: number; url: string }, index: number) => (
              <div
                key={item.id || index}
                className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg"
              >
                {/* Use URL from form state if available, fallback to upload manager preview */}
                {item.url || galleryUM.previews[index] ? (
                  <img
                    src={item.url || galleryUM.previews[index]}
                    alt={`Previzualizare ${index + 1}`}
                    className="h-10 w-10 rounded object-cover shrink-0"
                  />
                ) : (
                  <ImageIcon className="h-6 w-6 text-muted-foreground shrink-0" />
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">
                    {galleryUM.files[index]?.name || `image-${index + 1}.jpg`}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {galleryUM.files[index]?.size
                      ? formatFileSize(galleryUM.files[index].size)
                      : "N/A"}
                  </p>
                  {item.id && (
                    <p className="text-xs text-emerald-600">Încărcat</p>
                  )}
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => handleRemoveGalleryImage(index)}
                  className="shrink-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        )}

        {gallery.length < 10 && (
          <UploadInput
            multiple
            accept="image/jpeg,image/png,image/webp"
            onChange={handleGalleryUpload}
          >
            <div className="flex items-center justify-center gap-2 p-4 border-2 border-dashed rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors cursor-pointer">
              <Plus className="h-4 w-4" />
              <span className="text-sm font-medium">
                Adaugă imagini în galerie
              </span>
            </div>
          </UploadInput>
        )}

        {/* Display upload errors for gallery */}
        {galleryUM.error && (
          <p className="text-sm text-destructive font-medium">
            {galleryUM.error.message}
          </p>
        )}
        {galleryUM.errors && galleryUM.errors.size > 0 && (
          <div className="space-y-1">
            {Array.from(galleryUM.errors.values()).map(
              (err: UploadError, idx: number) => (
                <p key={idx} className="text-sm text-destructive">
                  {err.message}
                </p>
              ),
            )}
          </div>
        )}
        {/* Form validation errors (only if no upload errors) */}
        {!galleryUM.error &&
          (!galleryUM.errors || galleryUM.errors.size === 0) &&
          errors.gallery && (
            <p className="text-sm text-destructive">
              {errors.gallery.message as string}
            </p>
          )}
      </div>

      <Separator />

      {/* YouTube Links */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <Label>Link-uri YouTube (opțional)</Label>
            <p className="text-sm text-muted-foreground">
              Maximum 3 videoclipuri
            </p>
          </div>
          <Badge variant="secondary">{fields.length} / 3</Badge>
        </div>

        {fields.map((field, index) => (
          <div key={field.id} className="flex gap-2">
            <div className="flex-1">
              <div className="relative">
                <Youtube className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  {...register(`youtubeLinks.${index}.url`)}
                  placeholder="https://youtube.com/watch?v=..."
                  className="pl-10"
                />
              </div>
              {errors.youtubeLinks?.[index]?.url && (
                <p className="text-sm text-destructive mt-1">
                  {errors.youtubeLinks[index]?.url?.message}
                </p>
              )}
            </div>
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={() => remove(index)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        ))}

        {fields.length < 3 && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => append({ url: "" })}
            className="w-full"
          >
            <Plus className="h-4 w-4 mr-2" />
            Adaugă link YouTube
          </Button>
        )}
      </div>
    </div>
  );
}
