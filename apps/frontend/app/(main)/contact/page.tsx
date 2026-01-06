import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { FaHouse, FaPhone, FaEnvelope, FaLocationDot } from "react-icons/fa6";
import { ContactForm } from "@/components/contact/ContactForm";
import { SocialLinks } from "@/components/footer/SocialLinks";
import { ScrollToTop } from "@/components/ScrollToTop";

import { constructMetadata } from "@/lib/metadata";

// ... existing imports

export const metadata = constructMetadata({
  title: "Contactează-ne",
  description:
    "Suntem aici să te ajutăm. Trimite-ne un mesaj și îți vom răspunde în cel mai scurt timp.",
});

export default function ContactPage() {
  return (
    <>
      <ScrollToTop />
      <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Breadcrumbs */}
        <nav className="mb-6 flex items-center gap-2 text-sm text-muted-foreground">
          <Link
            href="/"
            className="inline-flex items-center gap-1 transition-colors hover:text-foreground"
          >
            <FaHouse className="h-4 w-4" />
          </Link>
          <span>›</span>
          <span className="text-foreground">Contact</span>
        </nav>

        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="mb-3 text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
            Contactează-ne
          </h1>
          <p className="mx-auto max-w-2xl text-base text-muted-foreground sm:text-lg">
            Suntem aici să te ajutăm. Trimite-ne un mesaj și îți vom răspunde în
            cel mai scurt timp.
          </p>
        </div>

        {/* Two Column Layout */}
        <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-2">
          {/* Left Column - Contact Info */}
          <div className="glass-card space-y-8 p-6 sm:p-8">
            {/* Logo */}
            <div className="flex allign-left">
              <div className="relative h-24 w-24 sm:h-32 sm:w-32">
                {/* Dark mode logo */}
                <Image
                  src="/logo-unevent-favicon-white-on-black.png"
                  alt="UN:EVENT Logo"
                  fill
                  className="hidden object-contain dark:block"
                />
                {/* Light mode logo */}
                <Image
                  src="/logo-unevent-favicon-black-on-white.png"
                  alt="UN:EVENT Logo"
                  fill
                  className="block object-contain dark:hidden"
                />
              </div>
            </div>

            {/* Social Media */}
            <div>
              <h2 className="mb-4 text-lg font-semibold">Urmărește-ne</h2>
              <SocialLinks />
            </div>

            {/* Contact Information */}
            <div>
              <h2 className="mb-4 text-lg font-semibold">
                Informații de contact
              </h2>
              <div className="space-y-4">
                {/* Phone */}
                <a
                  href="tel:+40728567830"
                  className="flex items-center gap-3 text-muted-foreground transition-colors hover:text-foreground"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                    <FaPhone className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      Telefon
                    </p>
                    <p className="text-sm">+40 728 567 830</p>
                  </div>
                </a>

                {/* Email */}
                <a
                  href="mailto:contact@unevent.ro"
                  className="flex items-center gap-3 text-muted-foreground transition-colors hover:text-foreground"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                    <FaEnvelope className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">Email</p>
                    <p className="text-sm">contact@unevent.ro</p>
                  </div>
                </a>

                {/* Location */}
                <div className="flex items-center gap-3 text-muted-foreground">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                    <FaLocationDot className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      Locație
                    </p>
                    <p className="text-sm">Timișoara</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Contact Form */}
          <div className="glass-card p-6 sm:p-8">
            <h2 className="mb-6 text-2xl font-bold">Trimite-ne un mesaj</h2>
            <ContactForm />
          </div>
        </div>
      </div>
    </>
  );
}
