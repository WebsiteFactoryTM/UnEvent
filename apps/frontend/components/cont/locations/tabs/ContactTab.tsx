"use client"

import { useFormContext, useFieldArray } from "react-hook-form"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import {
  Phone,
  Mail,
  Globe,
  Plus,
  X,
  Facebook,
  Instagram,
  Linkedin,
  Youtube,
} from "lucide-react"
import { FaXTwitter, FaTiktok } from "react-icons/fa6"
import type { LocationFormData } from "@/forms/location/schema"

export function ContactTab() {
  const {
    register,
    control,
    formState: { errors },
  } = useFormContext<LocationFormData>()

  const { fields: phoneFields, append: appendPhone, remove: removePhone } = useFieldArray({
    control,
    name: "contact.phones",
  })

  const socialMediaFields = [
    { name: "facebook" as const, icon: Facebook, label: "Facebook", placeholder: "https://facebook.com/..." },
    { name: "instagram" as const, icon: Instagram, label: "Instagram", placeholder: "https://instagram.com/..." },
    { name: "x" as const, icon: FaXTwitter, label: "X (Twitter)", placeholder: "https://x.com/..." },
    { name: "linkedin" as const, icon: Linkedin, label: "LinkedIn", placeholder: "https://linkedin.com/..." },
    { name: "youtube" as const, icon: Youtube, label: "YouTube", placeholder: "https://youtube.com/..." },
    { name: "tiktok" as const, icon: FaTiktok, label: "TikTok", placeholder: "https://tiktok.com/@..." },
  ]

  return (
    <div className="space-y-6">
      {/* Phone Numbers */}
      <div className="space-y-3">
        <Label className="required">Telefoane (max 2)</Label>
        <p className="text-sm text-muted-foreground">
          Numerele de telefon trebuie să fie în format românesc (+40... sau 07...)
        </p>

        <div className="space-y-3">
          {phoneFields.map((field, index) => (
            <div key={field.id} className="flex gap-2">
              <div className="flex-1">
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    {...register(`contact.phones.${index}.number`)}
                    placeholder="+40712345678 sau 0712345678"
                    className="pl-10"
                    type="tel"
                  />
                </div>
                {errors.contact?.phones?.[index]?.number && (
                  <p className="text-sm text-destructive mt-1">
                    {errors.contact.phones[index]?.number?.message}
                  </p>
                )}
              </div>
              {phoneFields.length > 1 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => removePhone(index)}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          ))}

          {phoneFields.length < 2 && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => appendPhone({ number: "" })}
              className="w-full gap-2"
            >
              <Plus className="h-4 w-4" />
              Adaugă număr secundar
            </Button>
          )}
        </div>
      </div>

      <Separator />

      {/* Email */}
      <div className="space-y-2">
        <Label htmlFor="email" className="required">
          Email
        </Label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            id="email"
            type="email"
            placeholder="contact@locatia-ta.ro"
            className="pl-10"
            {...register("contact.email")}
            aria-invalid={errors.contact?.email ? "true" : "false"}
            aria-describedby={errors.contact?.email ? "email-error" : undefined}
          />
        </div>
        {errors.contact?.email && (
          <p id="email-error" className="text-sm text-destructive">
            {errors.contact.email.message}
          </p>
        )}
      </div>

      <Separator />

      {/* Website */}
      <div className="space-y-2">
        <Label htmlFor="website">Website (opțional)</Label>
        <div className="relative">
          <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            id="website"
            type="url"
            placeholder="https://www.locatia-ta.ro"
            className="pl-10"
            {...register("contact.website")}
          />
        </div>
        {errors.contact?.website && (
          <p className="text-sm text-destructive">{errors.contact.website.message}</p>
        )}
      </div>

      <Separator />

      {/* Social Media */}
      <div className="space-y-4">
        <div>
          <Label>Social Media (opțional)</Label>
          <p className="text-sm text-muted-foreground">
            Adaugă link-urile către profilurile tale de social media
          </p>
        </div>

        <div className="space-y-3">
          {socialMediaFields.map((field) => {
            const Icon = field.icon
            return (
              <div key={field.name} className="space-y-2">
                <Label htmlFor={`social-${field.name}`} className="text-sm font-normal flex items-center gap-2">
                  <Icon className="h-4 w-4" />
                  {field.label}
                </Label>
                <Input
                  id={`social-${field.name}`}
                  type="url"
                  placeholder={field.placeholder}
                  {...register(`socialLinks.${field.name}`)}
                />
                {errors.socialLinks?.[field.name] && (
                  <p className="text-sm text-destructive">
                    {errors.socialLinks[field.name]?.message}
                  </p>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Info box */}
      <div className="p-4 bg-muted/30 rounded-lg space-y-2">
        <p className="text-sm font-medium">💡 Sfat</p>
        <p className="text-sm text-muted-foreground">
          Detaliile de contact vor fi vizibile pe pagina publică a locației tale. Asigură-te că
          sunt corecte și actualizate pentru a primi rezervări.
        </p>
      </div>
    </div>
  )
}

