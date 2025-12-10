import type { Metadata } from "next";
import Link from "next/link";
import { AuthCard } from "@/components/auth/auth-card";
import { LoginForm } from "@/components/auth/login-form";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { RecaptchaScript } from "@/components/RecaptchaScript";

export const metadata: Metadata = {
  title: "Autentificare | UN:EVENT",
  description:
    "Autentifică-te în contul tău UN:EVENT pentru a accesa toate funcționalitățile platformei.",
};

export default async function LoginPage() {
  const session = await getServerSession(authOptions);
  if (session?.user) {
    return (
      <AuthCard title="Autentificare" subtitle="Esti deja autentificat.">
        <div className="space-y-4">
          <p className="text-center text-lg font-medium">
            Ce vrei sa faci mai departe?
          </p>

          <div className="flex gap-2">
            <Link href="/cont">
              <Button variant="default">Accesează contul meu</Button>
            </Link>
            <Link href="/">
              <Button variant="secondary">Pagina principală</Button>
            </Link>
          </div>
        </div>
      </AuthCard>
    );
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
      <RecaptchaScript />
      <LoginForm />
    </AuthCard>
  );
}
