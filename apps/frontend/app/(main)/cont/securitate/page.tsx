"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { SectionCard } from "@/components/cont/SectionCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormField } from "@/components/ui/form-field";
import { SubmitButton } from "@/components/ui/submit-button";
import { useSession } from "next-auth/react";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { FaCircleExclamation } from "react-icons/fa6";
import { CheckCircle2 } from "lucide-react";
import { changePassword } from "@/lib/api/auth";

const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Parola curentă este obligatorie."),
    newPassword: z
      .string()
      .min(8, "Parola trebuie să conțină minim 8 caractere.")
      .max(100, "Parola este prea lungă."),
    confirmPassword: z.string().min(1, "Te rugăm să confirmi parola."),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Parolele nu se potrivesc.",
    path: ["confirmPassword"],
  })
  .refine((data) => data.currentPassword !== data.newPassword, {
    message: "Parola nouă trebuie să fie diferită de parola curentă.",
    path: ["newPassword"],
  });

type ChangePasswordFormData = z.infer<typeof changePasswordSchema>;

export default function SecuritatePage() {
  const { data: session } = useSession();
  const user = session?.user;
  const { toast } = useToast();
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<ChangePasswordFormData>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (data: ChangePasswordFormData) => {
    if (!user?.email || !user?.id) {
      setError("Nu s-a putut identifica utilizatorul.");
      return;
    }

    setError(null);
    setIsSuccess(false);

    try {
      await changePassword({
        userId: user.id,
        email: user.email,
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      });

      setIsSuccess(true);
      reset(); // Clear form

      toast({
        title: "Succes",
        description: "Parola a fost schimbată cu succes.",
        variant: "success",
      });
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Eroare la schimbarea parolei.";
      setError(errorMessage);
      toast({
        title: "Eroare",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Change Password */}
      <SectionCard
        title="Schimbă Parola"
        description="Actualizează parola contului tău pentru a-ți menține securitatea"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <FaCircleExclamation className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {isSuccess && (
            <Alert className="bg-green-500/10 border-green-500/20">
              <CheckCircle2 className="h-4 w-4 text-green-500" />
              <AlertDescription className="text-green-700 dark:text-green-400">
                Parola a fost schimbată cu succes!
              </AlertDescription>
            </Alert>
          )}

          <FormField
            label="Parola Curentă"
            required
            error={errors.currentPassword?.message}
          >
            <Input
              {...register("currentPassword")}
              type="password"
              placeholder="••••••••"
              autoComplete="current-password"
              className="bg-muted/50 border-input text-foreground"
              aria-invalid={!!errors.currentPassword}
            />
          </FormField>

          <FormField
            label="Parola Nouă"
            required
            error={errors.newPassword?.message}
            hint="Minim 8 caractere"
          >
            <Input
              {...register("newPassword")}
              type="password"
              placeholder="••••••••"
              autoComplete="new-password"
              className="bg-muted/50 border-input text-foreground"
              aria-invalid={!!errors.newPassword}
            />
          </FormField>

          <FormField
            label="Confirmă Parola Nouă"
            required
            error={errors.confirmPassword?.message}
          >
            <Input
              {...register("confirmPassword")}
              type="password"
              placeholder="••••••••"
              autoComplete="new-password"
              className="bg-muted/50 border-input text-foreground"
              aria-invalid={!!errors.confirmPassword}
            />
          </FormField>

          <div className="flex justify-end pt-2">
            <SubmitButton isLoading={isSubmitting} className="w-full sm:w-auto">
              Actualizează Parola
            </SubmitButton>
          </div>
        </form>
      </SectionCard>

      {/* Change Email */}
      <SectionCard
        title="Schimbă Email"
        description="Actualizează adresa de email asociată contului tău"
      >
        <div className="space-y-4">
          <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
            <p className="text-sm text-muted-foreground">
              Email curent:{" "}
              <span className="font-semibold text-foreground">
                {user?.email}
              </span>
            </p>
          </div>
          <div className="p-4 bg-muted/50 rounded-lg border border-border/50">
            <p className="text-sm text-muted-foreground">
              Funcționalitatea de schimbare a email-ului va fi disponibilă în
              curând.
            </p>
          </div>
        </div>
      </SectionCard>

      {/* Delete Account */}
      <SectionCard
        title="Șterge Cont"
        description="Șterge permanent contul tău și toate datele asociate"
      >
        <div className="space-y-4">
          <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
            <h4 className="font-semibold text-red-500 mb-2">Atenție!</h4>
            <p className="text-sm text-muted-foreground">
              Ștergerea contului este permanentă și nu poate fi anulată. Toate
              datele tale vor fi șterse definitiv.
            </p>
          </div>
          <div className="p-4 bg-muted/50 rounded-lg border border-border/50">
            <p className="text-sm text-muted-foreground mb-4">
              Funcționalitatea de ștergere a contului va fi disponibilă în
              curând.
            </p>
            <Button variant="destructive" disabled className="w-full">
              Șterge Contul Permanent
            </Button>
          </div>
        </div>
      </SectionCard>
    </div>
  );
}
