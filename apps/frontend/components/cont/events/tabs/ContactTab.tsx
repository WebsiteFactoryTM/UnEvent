"use client"

import { useFormContext } from "react-hook-form"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Plus, X, Phone, Mail, Globe, Facebook, Instagram, Linkedin, Youtube } from "lucide-react"
import { FaXTwitter, FaTiktok } from "react-icons/fa6"
import type { EventFormData } from "@/forms/event/schema"

export function ContactTab() {
  const {
    register,
    watch,
    setValue,
    formState: { errors },
  } = useFormContext<EventFormData>()

  const phones = watch("contact.phones") || []

  const handleAddPhone = () => {
    if (phones.length < 2) {
      setValue("contact.phones", [...phones, { number: "" }], { shouldValidate: true })
    }
  }

  const handleRemovePhone = (index: number) => {
    const updated = phones.filter((_, i) => i !== index)
    setValue("contact.phones", updated, { shouldValidate: true })
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-2">Informații de contact</h3>
        <p className="text-sm text-muted-foreground">
          Adaugă modalitățile prin care participanții te pot contacta
        </p>
      </div>

      {/* Phone Numbers */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label>Telefoane contact (max 2)</Label>
          {phones.length < 2 && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleAddPhone}
              className="gap-1"
            >
              <Plus className="h-4 w-4" />
              Adaugă telefon
            </Button>
          )}
        </div>

        {phones.length === 0 ? (
          <div className="text-center py-8 border-2 border-dashed rounded-lg">
            <Phone className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">Niciun telefon adăugat</p>
            <Button
              type="button"
              variant="link"
              onClick={handleAddPhone}
              className="mt-2"
            >
              Adaugă primul telefon
            </Button>
          </div>
        ) : (
          <div className="space-y-2">
            {phones.map((_, index) => (
              <div key={index} className="flex gap-2">
                <div className="flex-1">
                  <Input
                    placeholder="+40722123456"
                    {...register(`contact.phones.${index}.number`)}
                  />
                  {errors.contact?.phones?.[index]?.number && (
                    <p className="text-sm text-destructive mt-1">
                      {errors.contact.phones[index]?.number?.message}
                    </p>
                  )}
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => handleRemovePhone(index)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>

      <Separator />

      {/* Email */}
      <div className="space-y-2">
        <Label htmlFor="email" className="required">
          <Mail className="inline h-4 w-4 mr-1" />
          Email
        </Label>
        <Input
          id="email"
          type="email"
          placeholder="contact@exemplu.ro"
          {...register("contact.email")}
          aria-invalid={errors.contact?.email ? "true" : "false"}
          aria-describedby={errors.contact?.email ? "email-error" : undefined}
        />
        {errors.contact?.email && (
          <p id="email-error" className="text-sm text-destructive">
            {errors.contact.email.message}
          </p>
        )}
      </div>

      {/* Website */}
      <div className="space-y-2">
        <Label htmlFor="website">
          <Globe className="inline h-4 w-4 mr-1" />
          Website
        </Label>
        <Input
          id="website"
          type="url"
          placeholder="https://www.exemplu.ro"
          {...register("contact.website")}
          aria-invalid={errors.contact?.website ? "true" : "false"}
          aria-describedby={errors.contact?.website ? "website-error" : undefined}
        />
        {errors.contact?.website && (
          <p id="website-error" className="text-sm text-destructive">
            {errors.contact.website.message}
          </p>
        )}
      </div>

      <Separator />

      {/* Social Media */}
      <div className="space-y-4">
        <div>
          <Label>Rețele sociale</Label>
          <p className="text-sm text-muted-foreground mt-1">
            Adaugă linkurile către profilurile evenimentului (opțional)
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Facebook */}
          <div className="space-y-2">
            <Label htmlFor="facebook" className="flex items-center gap-2">
              <Facebook className="h-4 w-4 text-blue-600" />
              Facebook
            </Label>
            <Input
              id="facebook"
              type="url"
              placeholder="https://facebook.com/..."
              {...register("socialLinks.facebook")}
            />
            {errors.socialLinks?.facebook && (
              <p className="text-sm text-destructive">{errors.socialLinks.facebook.message}</p>
            )}
          </div>

          {/* Instagram */}
          <div className="space-y-2">
            <Label htmlFor="instagram" className="flex items-center gap-2">
              <Instagram className="h-4 w-4 text-pink-600" />
              Instagram
            </Label>
            <Input
              id="instagram"
              type="url"
              placeholder="https://instagram.com/..."
              {...register("socialLinks.instagram")}
            />
            {errors.socialLinks?.instagram && (
              <p className="text-sm text-destructive">{errors.socialLinks.instagram.message}</p>
            )}
          </div>

          {/* X (Twitter) */}
          <div className="space-y-2">
            <Label htmlFor="x" className="flex items-center gap-2">
              <FaXTwitter className="h-4 w-4" />
              X (Twitter)
            </Label>
            <Input
              id="x"
              type="url"
              placeholder="https://x.com/..."
              {...register("socialLinks.x")}
            />
            {errors.socialLinks?.x && (
              <p className="text-sm text-destructive">{errors.socialLinks.x.message}</p>
            )}
          </div>

          {/* LinkedIn */}
          <div className="space-y-2">
            <Label htmlFor="linkedin" className="flex items-center gap-2">
              <Linkedin className="h-4 w-4 text-blue-700" />
              LinkedIn
            </Label>
            <Input
              id="linkedin"
              type="url"
              placeholder="https://linkedin.com/..."
              {...register("socialLinks.linkedin")}
            />
            {errors.socialLinks?.linkedin && (
              <p className="text-sm text-destructive">{errors.socialLinks.linkedin.message}</p>
            )}
          </div>

          {/* YouTube */}
          <div className="space-y-2">
            <Label htmlFor="youtube-social" className="flex items-center gap-2">
              <Youtube className="h-4 w-4 text-red-600" />
              YouTube
            </Label>
            <Input
              id="youtube-social"
              type="url"
              placeholder="https://youtube.com/@..."
              {...register("socialLinks.youtube")}
            />
            {errors.socialLinks?.youtube && (
              <p className="text-sm text-destructive">{errors.socialLinks.youtube.message}</p>
            )}
          </div>

          {/* TikTok */}
          <div className="space-y-2">
            <Label htmlFor="tiktok" className="flex items-center gap-2">
              <FaTiktok className="h-4 w-4" />
              TikTok
            </Label>
            <Input
              id="tiktok"
              type="url"
              placeholder="https://tiktok.com/@..."
              {...register("socialLinks.tiktok")}
            />
            {errors.socialLinks?.tiktok && (
              <p className="text-sm text-destructive">{errors.socialLinks.tiktok.message}</p>
            )}
          </div>
        </div>
      </div>

      <Separator />

      <div className="p-4 border rounded-lg bg-muted/20">
        <p className="text-sm text-muted-foreground">
          <strong>Sfat:</strong> Completează cât mai multe informații de contact pentru a crește șansele 
          ca participanții să te contacteze. Profilurile de social media ajută la promovarea evenimentului.
        </p>
      </div>
    </div>
  )
}





