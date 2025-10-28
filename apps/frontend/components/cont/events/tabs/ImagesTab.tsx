"use client"

import { useState } from "react"
import { useFormContext } from "react-hook-form"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Upload, X, Image as ImageIcon, Youtube } from "lucide-react"
import { ImageConstraintsNote } from "@/lib/ui/ImageConstraintsNote"
import type { EventFormData } from "@/forms/event/schema"

export function ImagesTab() {
  const {
    watch,
    setValue,
    formState: { errors },
  } = useFormContext<EventFormData>()

  const featuredImage = watch("featuredImage")
  const gallery = watch("gallery") || []
  const youtubeLinks = watch("youtubeLinks") || []

  const [ytInput, setYtInput] = useState("")

  // Featured Image handlers
  const handleFeaturedImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setValue("featuredImage", file, { shouldValidate: true })
    }
  }

  const handleRemoveFeaturedImage = () => {
    setValue("featuredImage", undefined, { shouldValidate: true })
  }

  // Gallery handlers
  const handleGalleryUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    const currentGallery = gallery || []
    const remaining = 10 - currentGallery.length
    const filesToAdd = files.slice(0, remaining)
    
    if (filesToAdd.length > 0) {
      setValue("gallery", [...currentGallery, ...filesToAdd], { shouldValidate: true })
    }
  }

  const handleRemoveGalleryImage = (index: number) => {
    const updated = gallery.filter((_, i) => i !== index)
    setValue("gallery", updated, { shouldValidate: true })
  }

  // YouTube handlers
  const handleAddYouTubeLink = () => {
    if (ytInput.trim() && youtubeLinks.length < 3) {
      try {
        new URL(ytInput) // Validate URL
        setValue("youtubeLinks", [...youtubeLinks, { url: ytInput }], { shouldValidate: true })
        setYtInput("")
      } catch {
        // Invalid URL, do nothing
      }
    }
  }

  const handleRemoveYouTubeLink = (index: number) => {
    const updated = youtubeLinks.filter((_, i) => i !== index)
    setValue("youtubeLinks", updated, { shouldValidate: true })
  }

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " B"
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB"
    return (bytes / (1024 * 1024)).toFixed(1) + " MB"
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-2">Materiale vizuale</h3>
        <p className="text-sm text-muted-foreground">
          Adaugă imagini și videoclipuri care prezintă evenimentul.
        </p>
      </div>

      {/* Featured Image */}
      <div className="space-y-3">
        <Label htmlFor="featured-image">Imagine principală</Label>
        <p className="text-sm text-muted-foreground">
          Imaginea care va apărea în listările de evenimente
        </p>

        {!featuredImage ? (
          <div className="border-2 border-dashed rounded-lg p-8 text-center hover:border-primary/50 transition-colors">
            <input
              id="featured-image"
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleFeaturedImageUpload}
              className="hidden"
            />
            <label htmlFor="featured-image" className="cursor-pointer">
              <div className="flex flex-col items-center gap-2">
                <Upload className="h-10 w-10 text-muted-foreground" />
                <span className="text-sm font-medium">Click pentru a încărca</span>
                <span className="text-xs text-muted-foreground">JPG, PNG sau WebP</span>
              </div>
            </label>
          </div>
        ) : (
          <div className="flex items-center gap-3 p-3 border rounded-lg bg-muted/20">
            <ImageIcon className="h-8 w-8 text-muted-foreground shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{featuredImage.name}</p>
              <p className="text-xs text-muted-foreground">{formatFileSize(featuredImage.size)}</p>
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
        )}

        {errors.featuredImage && (
          <p className="text-sm text-destructive">{errors.featuredImage.message}</p>
        )}
      </div>

      <Separator />

      {/* Gallery */}
      <div className="space-y-3">
        <Label htmlFor="gallery">Galerie foto (max 10 imagini)</Label>
        <p className="text-sm text-muted-foreground">
          Arată atmosfera și momentele importante ale evenimentului
        </p>

        {gallery.length < 10 && (
          <div className="border-2 border-dashed rounded-lg p-6 text-center hover:border-primary/50 transition-colors">
            <input
              id="gallery"
              type="file"
              accept="image/jpeg,image/png,image/webp"
              multiple
              onChange={handleGalleryUpload}
              className="hidden"
            />
            <label htmlFor="gallery" className="cursor-pointer">
              <div className="flex flex-col items-center gap-2">
                <Upload className="h-8 w-8 text-muted-foreground" />
                <span className="text-sm font-medium">
                  Click pentru a adăuga imagini
                </span>
                <span className="text-xs text-muted-foreground">
                  {gallery.length} / 10 imagini încărcate
                </span>
              </div>
            </label>
          </div>
        )}

        {gallery.length > 0 && (
          <div className="space-y-2">
            {gallery.map((file, index) => (
              <div key={index} className="flex items-center gap-3 p-3 border rounded-lg bg-muted/20">
                <ImageIcon className="h-6 w-6 text-muted-foreground shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{file.name}</p>
                  <p className="text-xs text-muted-foreground">{formatFileSize(file.size)}</p>
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

        {errors.gallery && (
          <p className="text-sm text-destructive">{errors.gallery.message}</p>
        )}
      </div>

      <Separator />

      {/* YouTube Links */}
      <div className="space-y-3">
        <Label>Linkuri YouTube (max 3)</Label>
        <p className="text-sm text-muted-foreground">
          Adaugă videoclipuri de pe YouTube despre eveniment
        </p>

        {youtubeLinks.length < 3 && (
          <div className="flex gap-2">
            <Input
              type="url"
              placeholder="https://www.youtube.com/watch?v=..."
              value={ytInput}
              onChange={(e) => setYtInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault()
                  handleAddYouTubeLink()
                }
              }}
            />
            <Button
              type="button"
              variant="secondary"
              onClick={handleAddYouTubeLink}
              disabled={!ytInput.trim()}
            >
              Adaugă
            </Button>
          </div>
        )}

        {youtubeLinks.length > 0 && (
          <div className="space-y-2">
            {youtubeLinks.map((link, index) => (
              <div key={index} className="flex items-center gap-3 p-3 border rounded-lg bg-muted/20">
                <Youtube className="h-6 w-6 text-red-500 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{link.url}</p>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => handleRemoveYouTubeLink(index)}
                  className="shrink-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        )}

        {errors.youtubeLinks && (
          <p className="text-sm text-destructive">{errors.youtubeLinks.message}</p>
        )}
      </div>

      <Separator />

      {/* Image Constraints */}
      <ImageConstraintsNote />
    </div>
  )
}





