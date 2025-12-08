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
import { signUp } from "@/lib/api/auth";
import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Mail, CheckCircle2 } from "lucide-react";
import { useTracking } from "@/app/providers/consent/TrackingEventsProvider";

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
  const { trackEvent } = useTracking();
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [userEmail, setUserEmail] = useState<string>("");

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

      // Store email for success message
      setUserEmail(data.email);
      setIsSuccess(true);

      // Track successful sign up
      trackEvent("lead", undefined, {
        selected_roles: data.roles,
        registration_method: "email",
      });

      toast({
        title: "Cont creat cu succes!",
        description: "Te rugăm să verifici email-ul pentru a-ți activa contul.",
        variant: "default",
      });
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

  // Show success component after account creation
  if (isSuccess) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col items-center justify-center space-y-4">
          <div className="rounded-full bg-primary/10 p-4">
            <Mail className="h-8 w-8 text-primary" />
          </div>
          <div className="space-y-2 text-center">
            <h3 className="text-xl font-semibold">Cont creat cu succes!</h3>
            <p className="text-sm text-muted-foreground">
              Am trimis un email de confirmare la
            </p>
            <p className="text-sm font-medium text-foreground break-all">
              {userEmail}
            </p>
          </div>
        </div>

        <div className="space-y-3 rounded-lg border border-border bg-muted/30 p-4">
          <div className="flex items-start space-x-2">
            <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 shrink-0" />
            <div className="space-y-1 text-sm">
              <p className="font-medium">Ce urmează?</p>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-2">
                <li>Verifică-ți inbox-ul pentru email-ul de confirmare</li>
                <li>Click pe link-ul din email pentru a-ți activa contul</li>
                <li>După activare, poți să te autentifici</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="space-y-2 text-center">
          <p className="text-xs text-muted-foreground">
            Nu ai primit email-ul? Verifică și folderul de spam sau{" "}
            <Link
              href="/auth/inregistrare"
              className="underline hover:text-foreground"
              onClick={() => setIsSuccess(false)}
            >
              încearcă din nou
            </Link>
            .
          </p>
        </div>

        <div className="flex gap-2 pt-2">
          <Link href="/auth/autentificare" className="flex-1">
            <Button variant="default" className="w-full">
              Mergi la autentificare
            </Button>
          </Link>
          <Link href="/" className="flex-1">
            <Button variant="secondary" className="w-full">
              Pagina principală
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
