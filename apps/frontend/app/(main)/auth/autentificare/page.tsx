import type { Metadata } from "next";
import Link from "next/link";
import { AuthCard } from "@/components/auth/auth-card";
import { LoginForm } from "@/components/auth/login-form";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Autentificare | UN:EVENT",
  description:
    "Autentifică-te în contul tău UN:EVENT pentru a accesa toate funcționalitățile platformei.",
};

export default async function LoginPage() {
  const session = await getServerSession(authOptions);
  if (session?.user) {
    redirect("/cont");
  }

  return (
    <AuthCard
      title="Autentificare"
      subtitle="Bine ai revenit."
      footer={
        <p className="text-sm text-muted-foreground">
          Nu ai cont?{" "}
          <Link
            href="/auth/inregistrare"
            className="font-medium text-foreground underline underline-offset-4 hover:text-foreground/80 transition-colors"
          >
            Creează-ți unul
          </Link>
        </p>
      }
    >
      <LoginForm />
    </AuthCard>
  );
}
