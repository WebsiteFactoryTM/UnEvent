"use client";

import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { FormField } from "@/components/ui/form-field";
import { SubmitButton } from "@/components/ui/submit-button";

import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { FaCircleExclamation } from "react-icons/fa6";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

const loginSchema = z.object({
  email: z
    .string()
    .min(1, "Email-ul este obligatoriu.")
    .email("Te rugăm să introduci o adresă de email validă."),
  password: z.string().min(1, "Parola este obligatorie."),
  rememberMe: z.boolean().optional(),
});

type LoginFormData = z.infer<typeof loginSchema>;

export function LoginForm() {
  const { toast } = useToast();
  const [error, setError] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);

  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
    control,
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
      rememberMe: false,
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      setIsPending(true);
      await signIn("credentials", {
        email: data.email,
        password: data.password,
        rememberMe: data.rememberMe,
        redirect: false,
      });

      toast({
        title: "Succes",
        description: "Autentificat cu succes.",
      });
      // Manual redirect after successful login
      router.push("/");
    } catch (error) {
      console.error("Error signing in", error);
      toast({
        title: "Eroare",
        description: "Autentificarea a eșuat.",
        variant: "destructive",
      });
      setError("Autentificarea a eșuat.");
    } finally {
      setIsPending(false);
    }
  };

  return (
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

      <FormField label="Parolă" required error={errors.password?.message}>
        <Input
          {...register("password")}
          type="password"
          placeholder="••••••••"
          autoComplete="current-password"
          className="backdrop-blur-sm input-glow"
          aria-invalid={!!errors.password}
        />
      </FormField>

      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Controller
            name="rememberMe"
            control={control}
            render={({ field: { onChange, value, name } }) => (
              <Checkbox
                id="rememberMe"
                name={name}
                checked={!!value}
                onCheckedChange={(checked) => onChange(checked === true)}
                className="checkbox-custom"
              />
            )}
          />
          <label
            htmlFor="rememberMe"
            className="text-sm cursor-pointer peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            Ține-mă minte
          </label>
        </div>

        <a
          href="/auth/recuperare-parola"
          className="text-sm underline underline-offset-4 hover:text-primary"
        >
          Ai uitat parola?
        </a>
      </div>

      <SubmitButton isLoading={isPending}>Autentificare</SubmitButton>
    </form>
  );
}
