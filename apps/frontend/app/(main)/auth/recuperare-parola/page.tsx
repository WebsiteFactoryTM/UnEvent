"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { AuthCard } from "@/components/auth/auth-card";
import { Input } from "@/components/ui/input";
import { FormField } from "@/components/ui/form-field";
import { SubmitButton } from "@/components/ui/submit-button";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { FaCircleExclamation } from "react-icons/fa6";
import { Mail, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { forgotPassword } from "@/lib/api/auth";

const forgotPasswordSchema = z.object({
  email: z
    .string()
    .min(1, "Email-ul este obligatoriu.")
    .email("Te rugăm să introduci o adresă de email validă."),
});

type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPasswordPage() {
  const { toast } = useToast();
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [userEmail, setUserEmail] = useState<string>("");

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = async (data: ForgotPasswordFormData) => {
    setIsPending(true);
    setError(null);

    try {
      await forgotPassword({ email: data.email });

      setUserEmail(data.email);
      setIsSuccess(true);

      toast({
        title: "Email trimis!",
        description: "Verifică-ți email-ul pentru link-ul de resetare.",
        variant: "success",
      });
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Eroare la trimiterea email-ului.";
      setError(errorMessage);
      toast({
        title: "Eroare",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsPending(false);
    }
  };

  if (isSuccess) {
    return (
      <AuthCard
        title="Verifică-ți email-ul"
        subtitle="Link-ul de resetare a fost trimis"
      >
        <div className="space-y-6 text-center">
          <Mail className="mx-auto h-16 w-16 text-primary" />
          <h2 className="text-2xl font-bold text-foreground">
            Email trimis cu succes!
          </h2>
          <p className="text-muted-foreground">
            Am trimis un link de resetare a parolei la{" "}
            <strong className="text-foreground">{userEmail}</strong>.
          </p>
          <p className="text-sm text-muted-foreground">
            Te rugăm să accesezi link-ul din email pentru a reseta parola.
            Link-ul este valabil pentru 24 de ore.
          </p>
          <div className="space-y-4 pt-4">
            <Link href="/auth/autentificare" className="block">
              <Button variant="default" className="w-full">
                Mergi la Autentificare
              </Button>
            </Link>
            <p className="text-xs text-muted-foreground">
              Nu ai primit email-ul? Verifică folderul Spam sau{" "}
              <button
                onClick={() => {
                  setIsSuccess(false);
                  setError(null);
                }}
                className="underline hover:text-foreground"
              >
                încearcă din nou
              </button>
              .
            </p>
          </div>
        </div>
      </AuthCard>
    );
  }

  return (
    <AuthCard
      title="Ai uitat parola?"
      subtitle="Introdu adresa ta de email și îți vom trimite un link de resetare"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {error && (
          <Alert variant="destructive">
            <FaCircleExclamation className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <FormField label="Email" required error={errors.email?.message}>
          <Input
            {...register("email")}
            type="email"
            placeholder="exemplu@email.com"
            autoComplete="email"
            className="backdrop-blur-sm input-glow"
            aria-invalid={!!errors.email}
          />
        </FormField>

        <SubmitButton isLoading={isPending}>
          Trimite link de resetare
        </SubmitButton>

        <div className="text-center">
          <Link
            href="/auth/autentificare"
            className="text-sm underline underline-offset-4 hover:text-primary"
          >
            Înapoi la autentificare
          </Link>
        </div>
      </form>
    </AuthCard>
  );
}
