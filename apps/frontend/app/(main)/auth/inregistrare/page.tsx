import type { Metadata } from "next";
import Link from "next/link";
import { AuthCard } from "@/components/auth/auth-card";
import { SignUpForm } from "@/components/auth/sign-up-form";

export const metadata: Metadata = {
  title: "Înregistrare | UN:EVENT",
  description:
    "Creează un cont nou pe UN:EVENT - platforma ta pentru evenimente memorabile.",
};

export default function SignUpPage() {
  return (
    <AuthCard
      title="Creează cont"
      subtitle="Alătură-te UN:EVENT."
      footer={
        <p className="text-sm text-muted-foreground">
          Ai deja cont?{" "}
          <Link
            href="/auth/autentificare"
            className="font-medium text-foreground underline underline-offset-4 hover:text-foreground/80 transition-colors"
          >
            Autentifică-te
          </Link>
        </p>
      }
    >
      <SignUpForm />
    </AuthCard>
  );
}
