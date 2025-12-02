import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Recuperare parolă | UN:EVENT",
  description:
    "Solicită resetarea parolei pentru contul tău UN:EVENT. Vei primi un link pe email.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function ForgotPasswordLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
