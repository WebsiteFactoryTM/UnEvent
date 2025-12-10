"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { AuthCard } from "@/components/auth/auth-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormField } from "@/components/ui/form-field";
import { SubmitButton } from "@/components/ui/submit-button";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { FaCircleExclamation } from "react-icons/fa6";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";
import Link from "next/link";
import { resetPassword } from "@/lib/api/auth";
import { RecaptchaScript } from "@/components/RecaptchaScript";

const resetPasswordSchema = z
  .object({
    password: z
      .string()
      .min(8, "Parola trebuie să conțină minim 8 caractere.")
      .max(100, "Parola este prea lungă."),
    confirmPassword: z.string().min(1, "Te rugăm să confirmi parola."),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Parolele nu se potrivesc.",
    path: ["confirmPassword"],
  });

type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

type ResetStatus = "loading" | "form" | "success" | "error" | "missing-token";

export default function ResetPasswordPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { toast } = useToast();
  const [status, setStatus] = useState<ResetStatus>("loading");
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  useEffect(() => {
    const token = searchParams.get("token");

    if (!token) {
      setStatus("missing-token");
      setError("Link-ul de resetare este invalid sau lipsește token-ul.");
      return;
    }

    setStatus("form");
  }, [searchParams]);

  const onSubmit = async (data: ResetPasswordFormData) => {
    const token = searchParams.get("token");

    if (!token) {
      setError("Token-ul lipsește din URL.");
      return;
    }

    try {
      await resetPassword({
        token,
        password: data.password,
      });

      setStatus("success");
      toast({
        title: "Succes",
        description:
          "Parola a fost resetată cu succes. Poți să te autentifici acum.",
        variant: "success",
      });

      // Redirect to login after 2 seconds
      setTimeout(() => {
        router.push("/auth/autentificare");
      }, 2000);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Eroare la resetarea parolei.";
      setError(errorMessage);
      setStatus("error");
      toast({
        title: "Eroare",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  if (status === "loading") {
    return (
      <AuthCard title="Resetează parola" subtitle="Se încarcă...">
        <div className="flex flex-col items-center justify-center space-y-4 py-8">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <p className="text-center text-muted-foreground">
            Se verifică link-ul de resetare...
          </p>
        </div>
      </AuthCard>
    );
  }

  if (status === "missing-token") {
    return (
      <AuthCard title="Resetează parola" subtitle="Link invalid">
        <div className="flex flex-col items-center justify-center space-y-4 py-8">
          <XCircle className="h-12 w-12 text-destructive" />
          <div className="space-y-2 text-center">
            <p className="text-lg font-medium text-foreground">
              Link-ul de resetare este invalid
            </p>
            <p className="text-sm text-muted-foreground">
              Link-ul poate fi expirat sau invalid. Te rugăm să soliciti un link
              nou.
            </p>
          </div>
          <div className="flex gap-2 pt-4">
            <Link href="/auth/recuperare-parola">
              <Button variant="default">Solicită link nou</Button>
            </Link>
            <Link href="/auth/autentificare">
              <Button variant="secondary">Înapoi la autentificare</Button>
            </Link>
          </div>
        </div>
      </AuthCard>
    );
  }

  if (status === "success") {
    return (
      <AuthCard title="Parolă resetată" subtitle="Succes!">
        <div className="flex flex-col items-center justify-center space-y-4 py-8">
          <CheckCircle2 className="h-12 w-12 text-green-500" />
          <p className="text-center text-lg font-medium text-foreground">
            Parola ta a fost resetată cu succes!
          </p>
          <p className="text-center text-sm text-muted-foreground">
            Vei fi redirecționat la pagina de autentificare...
          </p>
          <Link href="/auth/autentificare" className="pt-4">
            <Button variant="default">Mergi la autentificare</Button>
          </Link>
        </div>
      </AuthCard>
    );
  }

  return (
    <AuthCard
      title="Resetează parola"
      subtitle="Creează o parolă nouă pentru contul tău"
    >
      <RecaptchaScript />
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {error && (
          <Alert variant="destructive">
            <FaCircleExclamation className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <FormField
          label="Parolă nouă"
          required
          error={errors.password?.message}
          hint="Minim 8 caractere"
        >
          <Input
            {...register("password")}
            type="password"
            placeholder="••••••••"
            autoComplete="new-password"
            className="backdrop-blur-sm input-glow"
            aria-invalid={!!errors.password}
          />
        </FormField>

        <FormField
          label="Confirmă parola"
          required
          error={errors.confirmPassword?.message}
        >
          <Input
            {...register("confirmPassword")}
            type="password"
            placeholder="••••••••"
            autoComplete="new-password"
            className="backdrop-blur-sm input-glow"
            aria-invalid={!!errors.confirmPassword}
          />
        </FormField>

        <SubmitButton isLoading={isSubmitting}>Resetează parola</SubmitButton>

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
