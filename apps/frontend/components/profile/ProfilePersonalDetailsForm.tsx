"use client";
import React from "react";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { Profile, User } from "@/types/payload-types";
import { Button } from "../ui/button";
import { useForm } from "react-hook-form";
import z from "zod";
import { useToast } from "@/hooks/use-toast";
import { useUpdateProfile } from "@/lib/react-query/listings.queries";

const profileSchema = z.object({
  name: z.string().min(1, "Numele este obligatoriu"),
  email: z.string().email("Email-ul este invalid"),
  phone: z
    .string()
    .min(10, "Numărul de telefon trebuie să conțină cel puțin 10 cifre"),
  website: z.string().url("Website-ul este invalid"),
  city: z.string().min(1, "Orașul este obligatoriu"),
  bio: z.string().min(10, "Bio-ul trebuie să conțină cel puțin 10 caractere"),
});

export type ProfileFormData = z.infer<typeof profileSchema>;

const ProfilePersonalDetailsForm = ({ profile }: { profile: Profile }) => {
  const { toast } = useToast();
  const updateProfileMutation = useUpdateProfile();

  const {
    register,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<ProfileFormData>({
    defaultValues: {
      name: profile.name,
      phone: profile.phone || "",
      website: profile.website || "",
      city: profile.city || "",
      bio: profile.bio || "",
    },
  });

  const onSubmit = async (data: ProfileFormData) => {
    try {
      await updateProfileMutation.mutateAsync({
        profileId: profile.id,
        data,
      });

      toast({
        title: "Succes",
        description: "Profilul a fost actualizat cu succes",
        variant: "default",
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
          <Textarea
            defaultValue={profile.bio || ""}
            rows={4}
            className="bg-muted/50 border-input text-foreground resize-none"
            {...register("bio")}
          />
        </div>
      </div>
      <div className="flex justify-end">
        <Button
          type="submit"
          disabled={isSubmitting || updateProfileMutation.isPending}
          className="bg-primary text-primary-foreground hover:bg-primary/90"
        >
          {isSubmitting || updateProfileMutation.isPending ? "Se salvează..." : "Salvează Modificările"}
        </Button>
      </div>
    </form>
  );
};

export default ProfilePersonalDetailsForm;
