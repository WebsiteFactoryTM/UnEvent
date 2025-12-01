"use client";

import { useForm } from "react-hook-form";
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
import { signUp } from "@/lib/api/auth";
import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

const signUpSchema = z.object({
  email: z
    .string()
    .min(1, "Email-ul este obligatoriu.")
    .email("Te rugăm să introduci o adresă de email validă."),
  password: z
    .string()
    .min(8, "Parola trebuie să conțină minim 8 caractere.")
    .max(100, "Parola este prea lungă."),
  displayName: z.string().optional(),
  roles: z.array(z.string()).min(1, "Trebuie să selectezi cel puțin un rol."),
  agreeTermsAndConditions: z
    .boolean()
    .refine(
      (val) => val === true,
      "Trebuie să accepți termenii și condițiile.",
    ),
  agreePrivacyPolicy: z
    .boolean()
    .refine(
      (val) => val === true,
      "Trebuie să accepți politica de confidențialitate.",
    ),
});

type SignUpFormData = z.infer<typeof signUpSchema>;

const roleOptions = [
  {
    value: "client",
    label: "Client",
    description: "Caut locații, servicii și evenimente",
    disabled: true,
    required: true,
  },
  {
    value: "host",
    label: "Proprietar locație",
    description: "Ofer spații pentru evenimente",
  },
  {
    value: "provider",
    label: "Furnizor servicii",
    description: "Ofer servicii pentru evenimente",
  },
  {
    value: "organizer",
    label: "Organizator de evenimente",
    description: "Organizez, promovez si gestionez evenimente",
  },
];

export function SignUpForm() {
  const { toast } = useToast();
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<SignUpFormData>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      email: "",
      password: "",
      displayName: "",
      roles: ["client"], // Default to client role
      agreeTermsAndConditions: false,
      agreePrivacyPolicy: false,
    },
  });

  const agreeTerms = watch("agreeTermsAndConditions");
  const agreePrivacy = watch("agreePrivacyPolicy");
  const selectedRoles = watch("roles"); // Watch selected roles

  const handleRoleChange = (roleValue: string, checked: boolean) => {
    const currentRoles = selectedRoles || [];
    if (checked) {
      setValue("roles", [...currentRoles, roleValue]);
    } else {
      setValue(
        "roles",
        currentRoles.filter((r) => r !== roleValue),
      );
    }
  };

  const onSubmit = async (data: SignUpFormData) => {
    setIsPending(true);
    setError(null);

    try {
      // Create the user account
      await signUp(data);

      toast({
        title: "Succes",
        description: "Cont creat cu succes.",
      });

      // Automatically log in the user after successful signup using NextAuth
      const loginResult = await signIn("credentials", {
        email: data.email,
        password: data.password,
        redirect: false,
        callbackUrl: "/cont",
      });

      if (loginResult?.ok) {
        // Both signup and login successful - show success component
        setIsSuccess(true);
        toast({
          title: "Bine ai venit!",
          description: "Cont creat și autentificare reușită.",
          variant: "success",
        });
      } else {
        // Account created but login failed - redirect to login page
        toast({
          title: "Cont creat",
          description:
            "Contul a fost creat cu succes. Te rugăm să te autentifici.",
          variant: "default",
        });
        router.push("/auth/autentificare");
      }
    } catch (err) {
      const error =
        err instanceof Error ? err : new Error("Eroare la crearea contului");
      setError(error);
      toast({
        title: "Eroare",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsPending(false);
    }
  };

  // Show success component if both signup and login succeeded
  if (isSuccess) {
    return (
      <div className="space-y-4">
        <p className="text-center text-lg font-medium">
          Cont creat cu succes! Ești autentificat.
        </p>
        <p className="text-center text-sm text-muted-foreground">
          Ce vrei să faci mai departe?
        </p>
        <div className="flex gap-2">
          <Link href="/cont" className="flex-1">
            <Button variant="default" className="w-full">
              Accesează contul meu
            </Button>
          </Link>
          <Link href="/" className="flex-1">
            <Button variant="secondary" className="w-full">
              Înapoi la pagina principală
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {error && (
        <Alert variant="destructive">
          <FaCircleExclamation className="h-4 w-4" />
          <AlertDescription>{error.message}</AlertDescription>
        </Alert>
      )}

      <FormField
        label="Nume afișat"
        hint="Opțional - cum vrei să fii identificat"
        error={errors.displayName?.message}
      >
        <Input
          {...register("displayName")}
          type="text"
          placeholder="ex: Ion Popescu"
          autoComplete="name"
          className="backdrop-blur-sm input-glow"
        />
      </FormField>

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

      <FormField
        label="Parolă"
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

      <div className="space-y-3 pt-2">
        <label className="text-sm font-medium leading-none">
          Selectează rolurile tale <span className="text-destructive">*</span>
        </label>
        <div className="space-y-3">
          {roleOptions.map((role) => (
            <div key={role.value} className="flex items-start space-x-3">
              <Checkbox
                id={`role-${role.value}`}
                checked={selectedRoles?.includes(role.value)}
                onCheckedChange={(checked) =>
                  handleRoleChange(role.value, checked === true)
                }
                disabled={role.disabled}
                aria-required={role.required}
                className="checkbox-custom"
              />
              <label
                htmlFor={`role-${role.value}`}
                className="text-sm leading-relaxed cursor-pointer peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                <span className="font-medium">{role.label}</span>
                {role.required && (
                  <span className="text-destructive ml-1">*</span>
                )}
                <span className="block text-muted-foreground text-xs mt-0.5">
                  {role.description}
                </span>
              </label>
            </div>
          ))}
        </div>
        {errors.roles && (
          <p className="text-xs text-destructive font-medium" role="alert">
            {errors.roles.message}
          </p>
        )}
      </div>

      <div className="space-y-3 pt-2">
        <div className="flex items-start space-x-3">
          <Checkbox
            id="terms"
            checked={agreeTerms}
            onCheckedChange={(checked) =>
              setValue("agreeTermsAndConditions", checked === true)
            }
            aria-invalid={!!errors.agreeTermsAndConditions}
            className="checkbox-custom"
          />
          <label
            htmlFor="terms"
            className="text-sm leading-relaxed cursor-pointer peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            Sunt de acord cu{" "}
            <a
              href="/termeni-si-conditii"
              className="underline underline-offset-4 hover:text-primary"
              target="_blank"
              rel="noopener noreferrer"
            >
              termenii și condițiile
            </a>
            <span className="text-destructive ml-1">*</span>
          </label>
        </div>
        {errors.agreeTermsAndConditions && (
          <p className="text-xs text-destructive font-medium ml-7" role="alert">
            {errors.agreeTermsAndConditions.message}
          </p>
        )}

        <div className="flex items-start space-x-3">
          <Checkbox
            id="privacy"
            checked={agreePrivacy}
            onCheckedChange={(checked) =>
              setValue("agreePrivacyPolicy", checked === true)
            }
            aria-invalid={!!errors.agreePrivacyPolicy}
            className="checkbox-custom"
          />
          <label
            htmlFor="privacy"
            className="text-sm leading-relaxed cursor-pointer peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            Sunt de acord cu{" "}
            <a
              href="/politica-de-confidentialitate"
              className="underline underline-offset-4 hover:text-primary"
              target="_blank"
              rel="noopener noreferrer"
            >
              politica de confidențialitate
            </a>
            <span className="text-destructive ml-1">*</span>
          </label>
        </div>
        {errors.agreePrivacyPolicy && (
          <p className="text-xs text-destructive font-medium ml-7" role="alert">
            {errors.agreePrivacyPolicy.message}
          </p>
        )}
      </div>

      <SubmitButton isLoading={isPending}>Creează cont</SubmitButton>
    </form>
  );
}
