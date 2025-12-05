"use client";

import type React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "next-themes";
import { useState, useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { SessionProvider, useSession } from "next-auth/react";
import { getQueryClient } from "@/lib/react-query";
import * as Sentry from "@sentry/nextjs";
import { AllConsentProviders } from "@/app/providers/consent";

function SentryUserContext() {
  const { data: session } = useSession();

  useEffect(() => {
    if (session?.user) {
      Sentry.setUser({
        id: session.user.id,
        email: session.user.email || undefined,
        username: session.user.name || undefined,
      });

      // Set additional context
      Sentry.setTag("user_roles", session.user.roles?.join(",") || "");
    } else {
      Sentry.setUser(null);
    }
  }, [session]);

  return null;
}

export function Providers({ children }: { children: React.ReactNode }) {
  const queryClient = getQueryClient();

  return (
    <SessionProvider refetchInterval={60} refetchOnWindowFocus>
      <SentryUserContext />
      <QueryClientProvider client={queryClient}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <AllConsentProviders>
            {children}
            <Toaster />
          </AllConsentProviders>
        </ThemeProvider>
      </QueryClientProvider>
    </SessionProvider>
  );
}
