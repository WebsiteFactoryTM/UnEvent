"use client";

import { useFormContext, useFieldArray } from "react-hook-form";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ImageIcon, Upload, X, Plus, Youtube } from "lucide-react";
import type { UnifiedListingFormData } from "@/forms/listing/schema";

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

  const { fields, append, remove } = useFieldArray({
    control,
    name: "youtubeLinks",
  });

  const featuredImage = watch("featuredImage");
  const gallery = watch("gallery") || [];

  // Handle featured image upload (UI only)
  const handleFeaturedImageUpload = (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      // TODO: In real implementation, validate file type, size, dimensions
      setValue("featuredImage", file, { shouldValidate: true });
    }
  };

  // Handle gallery upload (UI only)
  const handleGalleryUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      const currentGallery = gallery || [];
      const remaining = 10 - currentGallery.length;
      const filesToAdd = files.slice(0, remaining);
      setValue("gallery", [...currentGallery, ...filesToAdd], {
        shouldValidate: true,
      });
    }
  };

  // Remove featured image
  const handleRemoveFeaturedImage = () => {
    setValue("featuredImage", undefined, { shouldValidate: true });
  };

  // Remove gallery image
  const handleRemoveGalleryImage = (index: number) => {
    const newGallery = gallery.filter((_, i) => i !== index);
    setValue("gallery", newGallery, { shouldValidate: true });
  };

  // Format file size for display
  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="space-y-6">
      {/* Featured Image */}
      <div className="space-y-3">
        <Label className="required">Imagine principală</Label>
        <p className="text-sm text-muted-foreground">
          Aceasta va fi imaginea de copertă
        </p>

        <div className="border-2 border-dashed rounded-lg p-6 bg-muted/30 hover:bg-muted/50 transition-colors">
          {featuredImage ? (
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 bg-background rounded-lg">
                <ImageIcon className="h-8 w-8 text-muted-foreground flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">
                    {featuredImage.name || "featured-image.jpg"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {featuredImage.size
                      ? formatFileSize(featuredImage.size)
                      : "N/A"}
                  </p>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleRemoveFeaturedImage}
                  className="flex-shrink-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ) : (
            <label className="flex flex-col items-center gap-3 cursor-pointer">
              <Upload className="h-10 w-10 text-muted-foreground" />
              <div className="text-center space-y-1">
                <p className="text-sm font-medium">
                  Click pentru a încărca imagine
                </p>
                <p className="text-xs text-muted-foreground">
                  Format: JPG, PNG • Max: 5MB • Recomandat: 1920x1080px
                </p>
              </div>
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleFeaturedImageUpload}
                className="hidden"
              />
            </label>
          )}
        </div>

        {errors.featuredImage && (
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
            {gallery.map((file: any, index: number) => (
              <div
                key={index}
                className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg"
              >
                <ImageIcon className="h-6 w-6 text-muted-foreground flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">
                    {file.name || `image-${index + 1}.jpg`}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {file.size ? formatFileSize(file.size) : "N/A"}
                  </p>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => handleRemoveGalleryImage(index)}
                  className="flex-shrink-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        )}

        {gallery.length < 10 && (
          <label className="flex items-center justify-center gap-2 p-4 border-2 border-dashed rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors cursor-pointer">
            <Plus className="h-4 w-4" />
            <span className="text-sm font-medium">
              Adaugă imagini în galerie
            </span>
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              multiple
              onChange={handleGalleryUpload}
              className="hidden"
            />
          </label>
        )}

        {errors.gallery && (
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
