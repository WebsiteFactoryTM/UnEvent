import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Confirmare email | UN:EVENT",
  description:
    "Verifică-ți adresa de email pentru a-ți activa contul UN:EVENT.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function ConfirmEmailLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
