"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useRecaptcha } from "@/hooks/useRecaptcha";

const contactSchema = z.object({
  fullName: z
    .string()
    .min(2, "Numele trebuie să conțină cel puțin 2 caractere"),
  phone: z
    .string()
    .min(10, "Numărul de telefon trebuie să conțină cel puțin 10 cifre"),
  email: z.string().email("Adresa de email nu este validă"),
  subject: z.string().min(1, "Te rugăm să selectezi un subiect"),
  message: z
    .string()
    .min(10, "Mesajul trebuie să conțină cel puțin 10 caractere"),
  privacyConsent: z.boolean().refine((val) => val === true, {
    message: "Trebuie să accepți politica de confidențialitate",
  }),
});

type ContactFormData = z.infer<typeof contactSchema>;

export function ContactForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const { executeRecaptcha, isReady: isRecaptchaReady } = useRecaptcha();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      privacyConsent: false,
    },
  });

  const privacyConsent = watch("privacyConsent");

  const onSubmit = async (data: ContactFormData) => {
    setIsSubmitting(true);

    try {
      // Get reCAPTCHA token
      const recaptchaToken = await executeRecaptcha("contact_form");

      if (!recaptchaToken) {
        toast({
          title: "Eroare de verificare",
          description: "Nu am putut verifica cererile. Te rugăm să reîncerci.",
          variant: "destructive",
        });
        setIsSubmitting(false);
        return;
      }

      // Get backend URL from environment or use default
      const backendUrl =
        process.env.NEXT_PUBLIC_SERVER_URL || "http://localhost:4000";

      // Submit form to backend
      const response = await fetch(`${backendUrl}/api/contact`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fullName: data.fullName,
          email: data.email,
          phone: data.phone,
          subject: data.subject,
          message: data.message,
          recaptchaToken,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        toast({
          title: "Eroare la trimiterea mesajului",
          description:
            result.error || "A apărut o eroare. Te rugăm să reîncerci.",
          variant: "destructive",
        });
        setIsSubmitting(false);
        return;
      }

      toast({
        title: "Mesaj trimis cu succes!",
        description: "Îți vom răspunde în cel mai scurt timp posibil.",
      });

      reset();
    } catch (error) {
      console.error("[ContactForm] Error submitting form:", error);
      toast({
        title: "Eroare la trimiterea mesajului",
        description: "A apărut o eroare de conexiune. Te rugăm să reîncerci.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Full Name */}
      <div className="space-y-2">
        <Label htmlFor="fullName">
          Nume complet <span className="text-destructive">*</span>
        </Label>
        <Input
          id="fullName"
          type="text"
          placeholder="Introdu numele complet"
          {...register("fullName")}
          className={errors.fullName ? "border-destructive" : ""}
        />
        {errors.fullName && (
          <p className="text-sm text-destructive">{errors.fullName.message}</p>
        )}
      </div>

      {/* Phone */}
      <div className="space-y-2">
        <Label htmlFor="phone">
          Telefon <span className="text-destructive">*</span>
        </Label>
        <Input
          id="phone"
          type="tel"
          placeholder="Introdu numărul de telefon"
          {...register("phone")}
          className={errors.phone ? "border-destructive" : ""}
        />
        {errors.phone && (
          <p className="text-sm text-destructive">{errors.phone.message}</p>
        )}
      </div>

      {/* Email */}
      <div className="space-y-2">
        <Label htmlFor="email">
          Email <span className="text-destructive">*</span>
        </Label>
        <Input
          id="email"
          type="email"
          placeholder="Introdu adresa de email"
          {...register("email")}
          className={errors.email ? "border-destructive" : ""}
        />
        {errors.email && (
          <p className="text-sm text-destructive">{errors.email.message}</p>
        )}
      </div>

      {/* Subject */}
      <div className="space-y-2">
        <Label htmlFor="subject">
          Subiect <span className="text-destructive">*</span>
        </Label>
        <Select
          onValueChange={(value) =>
            setValue("subject", value, { shouldValidate: true })
          }
        >
          <SelectTrigger
            id="subject"
            className={errors.subject ? "border-destructive" : ""}
          >
            <SelectValue placeholder="Selectează un subiect" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="general">Întrebare generală</SelectItem>
            <SelectItem value="bug">Raportare bug/eroare platformă</SelectItem>
            <SelectItem value="listing">Raportare listare/profil</SelectItem>
          </SelectContent>
        </Select>
        {errors.subject && (
          <p className="text-sm text-destructive">{errors.subject.message}</p>
        )}
      </div>

      {/* Message */}
      <div className="space-y-2">
        <Label htmlFor="message">
          Mesaj <span className="text-destructive">*</span>
        </Label>
        <Textarea
          id="message"
          placeholder="Scrie mesajul tău aici..."
          rows={6}
          {...register("message")}
          className={errors.message ? "border-destructive" : ""}
        />
        {errors.message && (
          <p className="text-sm text-destructive">{errors.message.message}</p>
        )}
      </div>

      {/* Privacy Consent */}
      <div className="space-y-2">
        <div className="flex items-start gap-3">
          <Checkbox
            id="privacyConsent"
            checked={privacyConsent}
            onCheckedChange={(checked) =>
              setValue("privacyConsent", checked as boolean, {
                shouldValidate: true,
              })
            }
            className={errors.privacyConsent ? "border-destructive" : ""}
          />
          <Label
            htmlFor="privacyConsent"
            className="cursor-pointer text-sm leading-relaxed"
          >
            Sunt de acord cu{" "}
            <Link
              href="/politica-de-confidentialitate"
              className="text-primary underline-offset-4 hover:underline"
            >
              Politica de confidențialitate
            </Link>{" "}
            a UN:EVENT <span className="text-destructive">*</span>
          </Label>
        </div>
        {errors.privacyConsent && (
          <p className="text-sm text-destructive">
            {errors.privacyConsent.message}
          </p>
        )}
      </div>

      {/* Submit Button */}
      <Button
        type="submit"
        className="w-full"
        disabled={isSubmitting || !isRecaptchaReady}
      >
        {isSubmitting
          ? "Se trimite..."
          : !isRecaptchaReady
            ? "Se încarcă..."
            : "Trimite"}
      </Button>
    </form>
  );
}
