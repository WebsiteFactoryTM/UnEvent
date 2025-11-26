"use client";

import { useFormContext, useFieldArray } from "react-hook-form";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
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
} from "lucide-react";
import { FaXTwitter, FaTiktok } from "react-icons/fa6";
import type { UnifiedListingFormData } from "@/forms/listing/schema";

/**
 * Shared ContactTab component for all listing types
 * Handles contact information and social media links
 */
export function ContactTab() {
  const {
    register,
    control,
    formState: { errors },
  } = useFormContext<UnifiedListingFormData>();

  const {
    fields: phoneFields,
    append: appendPhone,
    remove: removePhone,
  } = useFieldArray({
    control,
    name: "contact.phones",
  });

  const socialMediaFields = [
    {
      name: "facebook" as const,
      icon: Facebook,
      label: "Facebook",
      placeholder: "https://facebook.com/...",
    },
    {
      name: "instagram" as const,
      icon: Instagram,
      label: "Instagram",
      placeholder: "https://instagram.com/...",
    },
    {
      name: "x" as const,
      icon: FaXTwitter,
      label: "X (Twitter)",
      placeholder: "https://x.com/...",
    },
    {
      name: "linkedin" as const,
      icon: Linkedin,
      label: "LinkedIn",
      placeholder: "https://linkedin.com/...",
    },
    {
      name: "youtube" as const,
      icon: Youtube,
      label: "YouTube",
      placeholder: "https://youtube.com/...",
    },
    {
      name: "tiktok" as const,
      icon: FaTiktok,
      label: "TikTok",
      placeholder: "https://tiktok.com/@...",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Phone Numbers */}
      <div className="space-y-3">
        <Label className="required">Telefoane (max 2)</Label>
        <p className="text-sm text-muted-foreground">
          Numerele de telefon trebuie să fie în format românesc (+40... sau
          07...)
        </p>

        {phoneFields.map((field, index) => (
          <div key={field.id} className="flex gap-2">
            <div className="flex-1">
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  {...register(`contact.phones.${index}.number`)}
                  placeholder="+40712345678"
                  className="pl-10"
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
                variant="outline"
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
            className="w-full"
          >
            <Plus className="h-4 w-4 mr-2" />
            Adaugă telefon
          </Button>
        )}
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
            {...register("contact.email")}
            placeholder="contact@exemplu.ro"
            className="pl-10"
          />
        </div>
        {errors.contact?.email && (
          <p className="text-sm text-destructive">
            {errors.contact.email.message}
          </p>
        )}
      </div>

      {/* Website */}
      <div className="space-y-2">
        <Label htmlFor="website">Website (opțional)</Label>
        <div className="relative">
          <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            id="website"
            type="text"
            {...register("contact.website")}
            placeholder="https://exemplu.ro"
            className="pl-10"
          />
        </div>
        {errors.contact?.website && (
          <p className="text-sm text-destructive">
            {errors.contact.website.message}
          </p>
        )}
      </div>

      <Separator />

      {/* Social Media */}
      <div className="space-y-4">
        <div>
          <Label>Rețele sociale (opțional)</Label>
          <p className="text-sm text-muted-foreground mt-1">
            Adaugă link-urile către profilurile tale de pe rețelele sociale
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {socialMediaFields.map(({ name, icon: Icon, label, placeholder }) => (
            <div key={name} className="space-y-2">
              <Label htmlFor={name}>{label}</Label>
              <div className="relative">
                <Icon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id={name}
                  type="url"
                  {...register(`socialLinks.${name}`)}
                  placeholder={placeholder}
                  className="pl-10"
                />
              </div>
              {errors.socialLinks?.[name] && (
                <p className="text-sm text-destructive">
                  {errors.socialLinks[name]?.message}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
