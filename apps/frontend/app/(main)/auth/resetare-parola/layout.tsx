import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Resetează parola | UN:EVENT",
  description:
    "Resetează parola pentru contul tău UN:EVENT folosind link-ul primit pe email.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function ResetPasswordLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
