"use client";
import React from "react";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { Profile, User } from "@/types/payload-types";
import { Button } from "../ui/button";
import { Controller, useForm } from "react-hook-form";
import z from "zod";
import { useToast } from "@/hooks/use-toast";
import { useProfile } from "@/lib/react-query/accountProfile.queries";
import { richTextSchema } from "@/lib/richText";
import { useRouter } from "next/navigation";
import { RestrictedRichTextEditor } from "../editor/RestrictedRichTextEditor";
import { zodResolver } from "@hookform/resolvers/zod";

const createUserFriendlyUrlSchema = (errorMessage: string = "URL invalid") => {
  return z
    .string()
    .optional()
    .transform((val) => {
      if (!val || val === "") return "";
      
      // If it already has a protocol, validate and return
      if (val.match(/^https?:\/\//)) {
        try {
          new URL(val);
          return val;
        } catch {
          throw new Error(errorMessage);
        }
      }
      
      // Reject obviously invalid patterns
      if (val.match(/^ww\./)) {
        throw new Error(errorMessage);
      }
      
      // Check for basic domain format
      if (!val.includes(".") || val.split(".").length < 2) {
        throw new Error(errorMessage);
      }
      
      // Add https:// and validate
      const withProtocol = `https://${val}`;
      try {
        new URL(withProtocol);
        return withProtocol;
      } catch {
        throw new Error(errorMessage);
      }
    });
};
const profileSchema = z.object({
  name: z.string().min(1, "Numele este obligatoriu"),
  email: z.string().email("Email-ul este invalid"),
  phone: z
    .string()
    .min(10, "Numărul de telefon trebuie să conțină cel puțin 10 cifre"),
  website: createUserFriendlyUrlSchema("Website-ul este invalid").optional(),
  city: z.string().optional(),
  bio: z.string().optional(),
  displayName: z.string().optional(),
  bio_rich: richTextSchema.optional(),
  socialMedia: z.object({
    facebook: createUserFriendlyUrlSchema("Facebook-ul este invalid").optional() ,
    instagram: createUserFriendlyUrlSchema("Instagram-ul este invalid").optional() ,
    linkedin: createUserFriendlyUrlSchema("LinkedIn-ul este invalid").optional() ,
    youtube: createUserFriendlyUrlSchema("YouTube-ul este invalid").optional() ,
    tiktok: createUserFriendlyUrlSchema("TikTok-ul este invalid").optional() ,
    twitch: createUserFriendlyUrlSchema("Twitch-ul este invalid").optional() ,
    x: createUserFriendlyUrlSchema("X-ul este invalid").optional(),
  }).optional(),
});

export type ProfileFormData = z.infer<typeof profileSchema>;

const ProfilePersonalDetailsForm = ({ profile }: { profile: Profile }) => {
  const { toast } = useToast();
  const { updateProfile: updateProfileMutation, isUpdating } = useProfile(
    profile.id,
  );

  const {
    register,
    handleSubmit,
    control,
    watch,
    formState: { isSubmitting, errors },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      email: (profile.user as User)?.email || "",
      name: profile.name,
      phone: profile.phone || "",
      website: profile.website || "",
      city: profile.city || "",
      bio: profile.bio || "",
      bio_rich: profile.bio_rich || {},
      displayName: profile.displayName || "",
      socialMedia: {
        facebook: profile.socialMedia?.facebook || "",
        instagram: profile.socialMedia?.instagram || "",
        linkedin: profile.socialMedia?.linkedin || "",
        youtube: profile.socialMedia?.youtube || "",
        tiktok: profile.socialMedia?.tiktok || "",
        twitch: profile.socialMedia?.twitch || "",
        x: profile.socialMedia?.x || "",
      },
    },
  });
console.log(errors);



  const onSubmit = async (data: ProfileFormData) => {
    try {
      // DEBUG: Log the rich text JSON before submission
      console.log('=== PROFILE SUBMIT DEBUG ===');
      console.log('bio_rich JSON:', JSON.stringify(data.bio_rich, null, 2));
      console.log('===========================');
      
      await updateProfileMutation({ data });

      toast({
        title: "Succes",
        description: "Profilul a fost actualizat cu succes",
        variant: "success",
      });
    } catch (error) {
      console.error(error);
      toast({
        title: "Eroare",
        description: "Profilul nu a fost actualizat",
        variant: "destructive",
      });
    }
  };
  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground/80">
            Nume Complet
          </label>
          <Input
            defaultValue={profile.name}
            className="bg-muted/50 border-input text-foreground"
            {...register("name")}
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground/80">
            Numele de afișare
          </label>
          <Input
            defaultValue={profile.displayName || ""}
            className="bg-muted/50 border-input text-foreground"
            {...register("displayName")}
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground/80">
            Email
          </label>
          <Input
            defaultValue={(profile.user as User)?.email || ""}
            type="email"
            className="bg-muted/50 border-input text-foreground"
            disabled
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground/80">
            Telefon
          </label>
          <Input
            defaultValue={profile.phone || ""}
            type="tel"
            className="bg-muted/50 border-input text-foreground"
            {...register("phone")}
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground/80">
            Website
          </label>
          <Input
            defaultValue={profile.website || ""}
            type="url"
            className="bg-muted/50 border-input text-foreground"
            {...register("website")}
          />
        </div>

        <div className="space-y-2 md:col-span-2">
          <label className="text-sm font-medium text-foreground/80">Oraș</label>
          <Input
            defaultValue={profile.city || ""}
            className="bg-muted/50 border-input text-foreground"
            {...register("city")}
          />
        </div>
        <div className="space-y-2 md:col-span-2">
          <label className="text-sm font-medium text-foreground/80">Bio</label>
          <Controller
            control={control}
            name="bio_rich"
            render={({ field }) => (
              <RestrictedRichTextEditor
                initialValue={field.value}
                legacyValue={watch("bio") || ""}
                onChange={(json) => {
                  field.onChange(json);
                  // Update legacy bio for plain text fallback if needed
                }}
                placeholder="Descrie-te în detaliu: ce faci, ce faci bine, ce faci rău..."
              />
            )}
          />
        </div>
        <div className="space-y-2 md:col-span-2">
          <h3 className="text-lg font-semibold border-b pb-2">
            Rețele Sociale
          </h3>
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground/80">
            Facebook
          </label>
          <Input
            defaultValue={profile.socialMedia?.facebook || ""}
            type="url"
            className="bg-muted/50 border-input text-foreground"
            {...register("socialMedia.facebook")}
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground/80">
            Instagram
          </label>
          <Input
            defaultValue={profile.socialMedia?.instagram || ""}
            type="url"
            className="bg-muted/50 border-input text-foreground"
            {...register("socialMedia.instagram")}
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground/80">
            YouTube
          </label>
          <Input
            defaultValue={profile.socialMedia?.youtube || ""}
            type="url"
            className="bg-muted/50 border-input text-foreground"
            {...register("socialMedia.youtube")}
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground/80">
            TikTok
          </label>
          <Input
            defaultValue={profile.socialMedia?.tiktok || ""}
            type="url"
            className="bg-muted/50 border-input text-foreground"
            {...register("socialMedia.tiktok")}
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground/80">
            Twitch
          </label>
          <Input
            defaultValue={profile.socialMedia?.twitch || ""}
            type="url"
            className="bg-muted/50 border-input text-foreground"
            {...register("socialMedia.twitch")}
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground/80">
            X (Twitter)
          </label>
          <Input
            defaultValue={profile.socialMedia?.x || ""}
            type="url"
            className="bg-muted/50 border-input text-foreground"
            {...register("socialMedia.x")}
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground/80">
            LinkedIn
          </label>
          <Input
            defaultValue={profile.socialMedia?.linkedin || ""}
            type="url"
            className="bg-muted/50 border-input text-foreground"
            {...register("socialMedia.linkedin")}
          />
        </div>
      </div>
      <div className="flex justify-end">
        <Button
          type="submit"
          disabled={isSubmitting || isUpdating}
          className="bg-primary text-primary-foreground hover:bg-primary/90"
        >
          {isSubmitting || isUpdating
            ? "Se salvează..."
            : "Salvează Modificările"}
        </Button>
      </div>
    </form>
  );
};

export default ProfilePersonalDetailsForm;
