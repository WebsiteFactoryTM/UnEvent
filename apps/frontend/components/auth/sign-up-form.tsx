"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { FormField } from "@/components/ui/form-field"
import { SubmitButton } from "@/components/ui/submit-button"
import { useSignUp } from "@/hooks/use-sign-up"
import { useToast } from "@/hooks/use-toast"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { FaCircleExclamation } from "react-icons/fa6"

const signUpSchema = z.object({
  email: z.string().min(1, "Email-ul este obligatoriu.").email("Te rugăm să introduci o adresă de email validă."),
  password: z.string().min(8, "Parola trebuie să conțină minim 8 caractere.").max(100, "Parola este prea lungă."),
  displayName: z.string().optional(),
  roles: z.array(z.string()).refine((roles) => roles.includes("organizer"), {
    message: "Rolul de organizator este obligatoriu.",
  }),
  agreeTermsAndConditions: z.boolean().refine((val) => val === true, "Trebuie să accepți termenii și condițiile."),
  agreePrivacyPolicy: z.boolean().refine((val) => val === true, "Trebuie să accepți politica de confidențialitate."),
})

type SignUpFormData = z.infer<typeof signUpSchema>

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
]

export function SignUpForm() {
  const { toast } = useToast()
  const { mutate: signUp, isPending, error } = useSignUp()

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
      roles: ["client"], // Default to organizer role
      agreeTermsAndConditions: false,
      agreePrivacyPolicy: false,
    },
  })

  const agreeTerms = watch("agreeTermsAndConditions")
  const agreePrivacy = watch("agreePrivacyPolicy")
  const selectedRoles = watch("roles") // Watch selected roles

  const handleRoleChange = (roleValue: string, checked: boolean) => {
    const currentRoles = selectedRoles || []
    if (checked) {
      setValue("roles", [...currentRoles, roleValue])
    } else {
      setValue(
        "roles",
        currentRoles.filter((r) => r !== roleValue),
      )
    }
  }

  const onSubmit = (data: SignUpFormData) => {
    signUp(data, {
      onSuccess: (response) => {
        toast({
          title: "Succes",
          description: response.message || "Cont creat cu succes.",
        })
        // TODO: Navigate to desired destination (e.g., dashboard or profile setup)
        console.log("[v0] Sign up successful:", response.user)
      },
      onError: (error) => {
        toast({
          title: "Eroare",
          description: error.message,
          variant: "destructive",
        })
      },
    })
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {error && (
        <Alert variant="destructive">
          <FaCircleExclamation className="h-4 w-4" />
          <AlertDescription>{error.message}</AlertDescription>
        </Alert>
      )}

      <FormField label="Nume afișat" hint="Opțional - cum vrei să fii identificat" error={errors.displayName?.message}>
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

      <FormField label="Parolă" required error={errors.password?.message} hint="Minim 8 caractere">
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
                onCheckedChange={(checked) => handleRoleChange(role.value, checked === true)}
                disabled={role.disabled}
                aria-required={role.required}
                className="checkbox-custom"
              />
              <label
                htmlFor={`role-${role.value}`}
                className="text-sm leading-relaxed cursor-pointer peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                <span className="font-medium">{role.label}</span>
                {role.required && <span className="text-destructive ml-1">*</span>}
                <span className="block text-muted-foreground text-xs mt-0.5">{role.description}</span>
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
            onCheckedChange={(checked) => setValue("agreeTermsAndConditions", checked === true)}
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
            onCheckedChange={(checked) => setValue("agreePrivacyPolicy", checked === true)}
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
  )
}
