"use client"

import { useFormContext, Controller, useFieldArray } from "react-hook-form"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ImageIcon, Upload, X, Plus, Youtube } from "lucide-react"
import { ImageConstraintsNote } from "@/lib/ui/ImageConstraintsNote"
import type { LocationFormData } from "@/forms/location/schema"

export function ImagesTab() {
  const {
    register,
    control,
    watch,
    setValue,
    formState: { errors },
  } = useFormContext<LocationFormData>()

  const { fields, append, remove } = useFieldArray({
    control,
    name: "youtubeLinks",
  })

  const featuredImage = watch("featuredImage")
  const gallery = watch("gallery") || []

  // Handle featured image upload (UI only)
  const handleFeaturedImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // TODO: In real implementation, validate file type, size, dimensions
      setValue("featuredImage", file, { shouldValidate: true })
    }
  }

  // Handle gallery upload (UI only)
  const handleGalleryUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length > 0) {
      const currentGallery = gallery || []
      const remaining = 10 - currentGallery.length
      const filesToAdd = files.slice(0, remaining)
      setValue("gallery", [...currentGallery, ...filesToAdd], { shouldValidate: true })
    }
  }

  // Remove featured image
  const handleRemoveFeaturedImage = () => {
    setValue("featuredImage", undefined, { shouldValidate: true })
  }

  // Remove gallery image
  const handleRemoveGalleryImage = (index: number) => {
    const newGallery = gallery.filter((_, i) => i !== index)
    setValue("gallery", newGallery, { shouldValidate: true })
  }

  // Format file size for display
  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  return (
    <div className="space-y-6">
      {/* Featured Image */}
      <div className="space-y-3">
        <Label className="required">Imagine principală</Label>
        <p className="text-sm text-muted-foreground">
          Aceasta va fi imaginea de copertă a locației tale
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
                    {featuredImage.size ? formatFileSize(featuredImage.size) : "N/A"}
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
            <label className="flex flex-col items-center gap-2 cursor-pointer">
              <Upload className="h-8 w-8 text-muted-foreground" />
              <p className="text-sm font-medium">Click pentru încărcare</p>
              <p className="text-xs text-muted-foreground">sau drag & drop (UI only)</p>
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
          <p className="text-sm text-destructive">{errors.featuredImage.message}</p>
        )}
      </div>

      <Separator />

      {/* Gallery */}
      <div className="space-y-3">
        <Label>Galerie foto (max 10 imagini)</Label>
        <p className="text-sm text-muted-foreground">
          Adaugă mai multe imagini pentru a arăta locația din unghiuri diferite
        </p>

        <div className="border-2 border-dashed rounded-lg p-6 bg-muted/30 hover:bg-muted/50 transition-colors">
          {gallery.length > 0 ? (
            <div className="space-y-3">
              {gallery.map((file, index) => (
                <div
                  key={index}
                  className="flex items-center gap-3 p-3 bg-background rounded-lg"
                >
                  <ImageIcon className="h-8 w-8 text-muted-foreground flex-shrink-0" />
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

              {gallery.length < 10 && (
                <label className="flex items-center justify-center gap-2 p-3 border-2 border-dashed rounded-lg cursor-pointer hover:bg-muted/50 transition-colors">
                  <Plus className="h-4 w-4" />
                  <span className="text-sm">Adaugă mai multe imagini</span>
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    multiple
                    onChange={handleGalleryUpload}
                    className="hidden"
                  />
                </label>
              )}
            </div>
          ) : (
            <label className="flex flex-col items-center gap-2 cursor-pointer">
              <Upload className="h-8 w-8 text-muted-foreground" />
              <p className="text-sm font-medium">Click pentru încărcare multiplă</p>
              <p className="text-xs text-muted-foreground">sau drag & drop (UI only)</p>
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                multiple
                onChange={handleGalleryUpload}
                className="hidden"
              />
            </label>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="secondary">{gallery.length} / 10</Badge>
          <p className="text-xs text-muted-foreground">imagini încărcate</p>
        </div>

        {errors.gallery && (
          <p className="text-sm text-destructive">{errors.gallery.message}</p>
        )}
      </div>

      <Separator />

      {/* YouTube Links */}
      <div className="space-y-3">
        <Label>Linkuri YouTube (max 3)</Label>
        <p className="text-sm text-muted-foreground">
          Adaugă videoclipuri YouTube pentru a prezenta locația în detaliu
        </p>

        <div className="space-y-3">
          {fields.map((field, index) => (
            <div key={field.id} className="flex gap-2">
              <div className="flex-1">
                <div className="relative">
                  <Youtube className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    {...register(`youtubeLinks.${index}.url`)}
                    placeholder="https://www.youtube.com/watch?v=..."
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
                variant="ghost"
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
              className="w-full gap-2"
            >
              <Plus className="h-4 w-4" />
              Adaugă link YouTube
            </Button>
          )}
        </div>

        {errors.youtubeLinks && typeof errors.youtubeLinks.message === "string" && (
          <p className="text-sm text-destructive">{errors.youtubeLinks.message}</p>
        )}
      </div>

      {/* Image Constraints Note */}
      <ImageConstraintsNote />
    </div>
  )
}

