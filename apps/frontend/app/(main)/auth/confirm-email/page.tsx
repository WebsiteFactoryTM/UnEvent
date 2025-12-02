"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { AuthCard } from "@/components/auth/auth-card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";

type VerificationStatus = "loading" | "success" | "error" | "missing-token";

interface VerificationResponse {
  message?: string;
  user?: {
    id: string | number;
    email: string;
  };
  errors?: Array<{ message: string }>;
}

export default function ConfirmEmailPage() {
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<VerificationStatus>("loading");
  const [message, setMessage] = useState<string>("");

  useEffect(() => {
    const token = searchParams.get("token");
    const userId = searchParams.get("userId");

    // If no token and no userId, show error
    if (!token && !userId) {
      setStatus("missing-token");
      setMessage("Link-ul de verificare este invalid sau lipsește token-ul.");
      return;
    }

    // Prefer token over userId (token is used when verify: true is enabled)
    const verificationParam = token || userId;

    if (!verificationParam) {
      setStatus("error");
      setMessage("Link-ul de verificare este invalid.");
      return;
    }

    // Call Payload API to verify
    const verifyEmail = async () => {
      try {
        const apiBase = process.env.NEXT_PUBLIC_API_URL;
        if (!apiBase) {
          throw new Error("API URL not configured");
        }

        // Payload's verify endpoint: POST /api/users/verify/:token
        const response = await fetch(
          `${apiBase}/api/users/verify/${verificationParam}`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            cache: "no-store",
          },
        );

        const data: VerificationResponse = await response.json();

        if (!response.ok) {
          // Handle error response
          const errorMessage =
            data.errors?.[0]?.message ||
            data.message ||
            "Verificarea a eșuat. Link-ul poate fi expirat sau invalid.";
          setStatus("error");
          setMessage(errorMessage);
          return;
        }

        // Success
        setStatus("success");
        setMessage(
          data.message ||
            "Email-ul tău a fost verificat cu succes! Poți să te autentifici acum.",
        );
      } catch (error) {
        console.error("[ConfirmEmail] Verification error:", error);
        setStatus("error");
        setMessage(
          error instanceof Error
            ? error.message
            : "A apărut o eroare la verificarea email-ului. Te rugăm să încerci din nou.",
        );
      }
    };

    verifyEmail();
  }, [searchParams]);

  return (
    <AuthCard
      title="Confirmare email"
      subtitle={
        status === "loading"
          ? "Verificăm email-ul tău..."
          : status === "success"
            ? "Email verificat cu succes!"
            : "Eroare la verificare"
      }
    >
      <div className="space-y-6">
        {status === "loading" && (
          <div className="flex flex-col items-center justify-center space-y-4 py-8">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
            <p className="text-center text-muted-foreground">
              Verificăm email-ul tău. Te rugăm să aștepți...
            </p>
          </div>
        )}

        {status === "success" && (
          <div className="flex flex-col items-center justify-center space-y-4 py-8">
            <CheckCircle2 className="h-12 w-12 text-green-500" />
            <p className="text-center text-lg font-medium text-foreground">
              {message}
            </p>
            <div className="flex gap-2 pt-4">
              <Link href="/auth/autentificare">
                <Button variant="default">Autentifică-te</Button>
              </Link>
              <Link href="/">
                <Button variant="secondary">Înapoi la pagina principală</Button>
              </Link>
            </div>
          </div>
        )}

        {(status === "error" || status === "missing-token") && (
          <div className="flex flex-col items-center justify-center space-y-4 py-8">
            <XCircle className="h-12 w-12 text-destructive" />
            <div className="space-y-2 text-center">
              <p className="text-lg font-medium text-foreground">
                Verificarea a eșuat
              </p>
              <p className="text-sm text-muted-foreground">{message}</p>
            </div>
            <div className="flex gap-2 pt-4">
              <Link href="/auth/inregistrare">
                <Button variant="default">Încearcă din nou</Button>
              </Link>
              <Link href="/">
                <Button variant="secondary">Înapoi la pagina principală</Button>
              </Link>
            </div>
            <p className="text-xs text-muted-foreground text-center max-w-md">
              Dacă problema persistă, te rugăm să ne contactezi la{" "}
              <a
                href="mailto:support@unevent.com"
                className="underline hover:text-foreground"
              >
                support@unevent.com
              </a>
            </p>
          </div>
        )}
      </div>
    </AuthCard>
  );
}
