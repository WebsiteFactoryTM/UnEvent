import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import {
  FaHouse,
  FaUsers,
  FaCamera,
  FaMessage,
  FaArrowTrendUp,
  FaBuilding,
  FaStar,
  FaCalendar,
  FaHeart,
  FaBullseye,
  FaBolt,
  FaCircleCheck,
  FaGlobe,
  FaMapPin,
  FaMusic,
  FaCalendarDays,
  FaEye,
  FaShield,
  FaAward,
  FaClock,
  FaSquareCheck,
  FaInfo,
  FaChevronRight,
} from "react-icons/fa6";
import { Button } from "@/components/ui/button";
import { ScrollToTop } from "@/components/ScrollToTop";
import { FAQSection } from "@/components/despre/FAQSection";

import { constructMetadata } from "@/lib/metadata";

// ... existing imports

export const metadata = constructMetadata({
  title: "Despre Noi",
  description:
    "Conectăm spații, oameni și idei. Fără zgomot. Doar potriviri bune. Descoperă povestea UN:EVENT și cum transformăm modul în care organizezi evenimente în România.",
});

export default function DesprePage() {
  return (
    <>
      <ScrollToTop />

      <div className="min-h-screen bg-background">
        {/* Breadcrumbs */}
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <nav className="flex items-center gap-2 text-sm text-muted-foreground">
            <Link href="/" className="hover:text-foreground transition-colors">
              <FaHouse className="w-4 h-4" />
            </Link>
            <FaChevronRight className="h-3 w-3" />
            <span className="text-foreground">Despre Noi</span>
          </nav>
        </div>

        {/* Hero Section */}
        <section className="relative py-12 md:py-20">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl text-center">
            <div className="mb-8 flex justify-center">
              <Image
                src="/logo-unevent-favicon-black-on-white.svg"
                alt="UN:EVENT Logo"
                width={96}
                height={96}
                className="h-20 md:h-24 w-auto dark:hidden logo-glow"
              />
              <Image
                src="/logo-unevent-favicon-white-on-black.svg"
                alt="UN:EVENT Logo"
                width={96}
                height={96}
                className="h-20 md:h-24 w-auto hidden dark:block logo-glow"
              />
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-4 md:mb-6 leading-tight text-balance">
              UN:EVENT — un loc simplu pentru orice moment
            </h1>

            <p className="text-lg sm:text-xl md:text-2xl text-muted-foreground mb-8 md:mb-12 max-w-3xl mx-auto leading-relaxed text-pretty">
              Conectăm spații, oameni și idei. Fără zgomot. Doar potriviri bune.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                className="text-base md:text-lg px-6 md:px-8 py-5 md:py-6"
                asChild
              >
                <Link href="/cont?tab=locatii">Listează un spațiu</Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="text-base md:text-lg px-6 md:px-8 py-5 md:py-6 bg-transparent"
                asChild
              >
                <Link href="/cont?tab=servicii">Devino prestator</Link>
              </Button>
            </div>
          </div>
        </section>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 pb-12 md:pb-16 max-w-6xl">
          <div className="p-4 sm:p-6 lg:p-8 space-y-12 md:space-y-20">
            {/* Cine suntem (Who We Are) */}
            <section className="space-y-6 md:space-y-8">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground text-center">
                Cine suntem
              </h2>

              <div className="max-w-4xl mx-auto space-y-4 md:space-y-6">
                <p className="text-base sm:text-lg md:text-xl text-muted-foreground leading-relaxed text-pretty">
                  UN:EVENT este un ghid urban viu și un marketplace pentru
                  spații, servicii și evenimente din România.
                </p>

                <p className="text-base sm:text-lg md:text-xl text-muted-foreground leading-relaxed text-pretty">
                  Suntem o platformă care pune în legătură gazde (proprietari de
                  locații), prestatori (DJ, foto-video, catering, organizatori
                  etc.) și publicul care caută unde și cum să-și organizeze
                  momentele importante — sau pur și simplu vrea să știe ce se
                  întâmplă în oraș.
                </p>

                <div className="glass-card bg-muted/30 backdrop-blur-sm border border-border/50 rounded-lg p-4 sm:p-6 space-y-2 text-sm mt-6 md:mt-8">
                  <p className="text-muted-foreground">
                    <strong className="text-foreground">
                      SC PIXEL FACTORY SRL
                    </strong>
                  </p>
                  <p className="text-muted-foreground">
                    CUI: 47452355 / Reg. Com.: J35/154/2023
                  </p>
                  <p className="text-muted-foreground">
                    Sediu social: Str. Bega, nr. 47, Ghiroda, Timiș
                  </p>
                  <p className="text-muted-foreground">
                    E-mail:{" "}
                    <a
                      href="mailto:contact@unevent.ro"
                      className="text-primary hover:underline"
                    >
                      contact@unevent.ro
                    </a>
                  </p>
                  <p className="text-muted-foreground">
                    Formular de contact:{" "}
                    <Link
                      href="/contact"
                      className="text-primary hover:underline"
                    >
                      pagina /contact
                    </Link>
                  </p>
                </div>
              </div>
            </section>

            {/* Ce facem (What We Do) */}
            <section className="space-y-6 md:space-y-8">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground text-center">
                Ce facem
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                <div className="feature-card p-4 md:p-6 space-y-4 rounded-lg">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <FaUsers className="w-6 h-6 text-primary feature-icon" />
                  </div>
                  <h3 className="text-lg md:text-xl font-bold text-foreground">
                    Creezi contul
                  </h3>
                  <p className="text-sm md:text-base text-muted-foreground text-pretty">
                    două minute, zero complicații
                  </p>
                </div>

                <div className="glass-card p-4 md:p-6 space-y-4 rounded-lg">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <FaCamera className="w-6 h-6 text-primary feature-icon" />
                  </div>
                  <h3 className="text-lg md:text-xl font-bold text-foreground">
                    Publici listarea
                  </h3>
                  <p className="text-sm md:text-base text-muted-foreground text-pretty">
                    titlu, descriere, adresă, fotografii, detalii
                  </p>
                </div>

                <div className="glass-card p-4 md:p-6 space-y-4 rounded-lg">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <FaMessage className="w-6 h-6 text-primary feature-icon" />
                  </div>
                  <h3 className="text-lg md:text-xl font-bold text-foreground">
                    Primești contacte/rezervări
                  </h3>
                  <p className="text-sm md:text-base text-muted-foreground text-pretty">
                    mesagerie internă, notificări, recenzii
                  </p>
                </div>

                <div className="glass-card p-4 md:p-6 space-y-4 rounded-lg">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <FaArrowTrendUp className="w-6 h-6 text-primary feature-icon" />
                  </div>
                  <h3 className="text-lg md:text-xl font-bold text-foreground">
                    Crești
                  </h3>
                  <p className="text-sm md:text-base text-muted-foreground text-pretty">
                    promovare, abonamente, profil curat și încredere
                  </p>
                </div>
              </div>
            </section>

            {/* Pentru cine (For Whom) */}
            <section className="space-y-6 md:space-y-8">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground text-center">
                Pentru cine
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                <div className="glass-card p-4 md:p-6 space-y-4 rounded-lg">
                  <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center">
                    <FaBuilding className="w-6 h-6 text-blue-500 feature-icon" />
                  </div>
                  <h3 className="text-lg md:text-xl font-bold text-foreground">
                    Gazde/Proprietari de spații
                  </h3>
                  <p className="text-sm md:text-base text-muted-foreground text-pretty">
                    care vor chirii corecte și calendar plin
                  </p>
                </div>

                <div className="glass-card p-4 md:p-6 space-y-4 rounded-lg">
                  <div className="w-12 h-12 rounded-full bg-yellow-500/10 flex items-center justify-center">
                    <FaStar className="w-6 h-6 text-yellow-500 feature-icon" />
                  </div>
                  <h3 className="text-lg md:text-xl font-bold text-foreground">
                    Prestatori
                  </h3>
                  <p className="text-sm md:text-base text-muted-foreground text-pretty">
                    care vor proiecte mai bune, nu doar mai multe
                  </p>
                </div>

                <div className="glass-card p-4 md:p-6 space-y-4 rounded-lg">
                  <div className="w-12 h-12 rounded-full bg-green-500/10 flex items-center justify-center">
                    <FaCalendar className="w-6 h-6 text-green-500 feature-icon" />
                  </div>
                  <h3 className="text-lg md:text-xl font-bold text-foreground">
                    Organizatori
                  </h3>
                  <p className="text-sm md:text-base text-muted-foreground text-pretty">
                    care caută rapid spațiul potrivit + echipa potrivită
                  </p>
                </div>

                <div className="glass-card p-4 md:p-6 space-y-4 rounded-lg">
                  <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center">
                    <FaHeart className="w-6 h-6 text-red-500 feature-icon" />
                  </div>
                  <h3 className="text-lg md:text-xl font-bold text-foreground">
                    Public cu chef de viață
                  </h3>
                  <p className="text-sm md:text-base text-muted-foreground text-pretty">
                    care vrea să știe ce se întâmplă acum în oraș
                  </p>
                </div>
              </div>
            </section>

            {/* Valorile noastre (Our Values) */}
            <section className="space-y-6 md:space-y-8">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground text-center">
                Valorile noastre
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                <div className="glass-card p-4 md:p-6 space-y-4 rounded-lg">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <FaBullseye className="w-6 h-6 text-primary feature-icon" />
                  </div>
                  <h3 className="text-lg md:text-xl font-bold text-foreground">
                    Minimal
                  </h3>
                  <p className="text-sm md:text-base text-muted-foreground text-pretty">
                    esențialiști. Rămân lucrurile care contează
                  </p>
                </div>

                <div className="glass-card p-4 md:p-6 space-y-4 rounded-lg">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <FaBolt className="w-6 h-6 text-primary feature-icon" />
                  </div>
                  <h3 className="text-lg md:text-xl font-bold text-foreground">
                    Mobile-first
                  </h3>
                  <p className="text-sm md:text-base text-muted-foreground text-pretty">
                    grija pentru detalii mici = experiențe mari
                  </p>
                </div>

                <div className="glass-card p-4 md:p-6 space-y-4 rounded-lg">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <FaCircleCheck className="w-6 h-6 text-primary feature-icon" />
                  </div>
                  <h3 className="text-lg md:text-xl font-bold text-foreground">
                    Corect
                  </h3>
                  <p className="text-sm md:text-base text-muted-foreground text-pretty">
                    reguli clare, mesagerie la obiect, recenzii reale
                  </p>
                </div>

                <div className="glass-card p-4 md:p-6 space-y-4 rounded-lg">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <FaGlobe className="w-6 h-6 text-primary feature-icon" />
                  </div>
                  <h3 className="text-lg md:text-xl font-bold text-foreground">
                    Deschis
                  </h3>
                  <p className="text-sm md:text-base text-muted-foreground text-pretty">
                    oricine își poate crea cont. Marketplace, nu club privat
                  </p>
                </div>
              </div>
            </section>

            {/* Ce oferim (What We Offer) */}
            <section className="space-y-6 md:space-y-8">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground text-center">
                Ce oferim
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
                <div className="glass-card p-4 md:p-6 space-y-4 rounded-lg bg-linear-to-br from-blue-500/10 to-blue-600/5 border-blue-500/20">
                  <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center">
                    <FaMapPin className="w-6 h-6 text-blue-500 feature-icon" />
                  </div>
                  <h3 className="text-lg md:text-xl font-bold text-foreground">
                    Locații
                  </h3>
                  <p className="text-sm md:text-base text-muted-foreground text-pretty">
                    de la săli de evenimente la grădini, studiouri, mansarde,
                    ateliere
                  </p>
                </div>

                <div className="glass-card p-4 md:p-6 space-y-4 rounded-lg bg-linear-to-br from-green-500/10 to-green-600/5 border-green-500/20">
                  <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center">
                    <FaMusic className="w-6 h-6 text-green-500 feature-icon" />
                  </div>
                  <h3 className="text-lg md:text-xl font-bold text-foreground">
                    Servicii
                  </h3>
                  <p className="text-sm md:text-base text-muted-foreground text-pretty">
                    DJ, trupe, foto-video, organizatori, decor, catering și
                    altele
                  </p>
                </div>

                <div className="glass-card p-4 md:p-6 space-y-4 rounded-lg bg-linear-to-br from-purple-500/10 to-purple-600/5 border-purple-500/20">
                  <div className="w-12 h-12 rounded-full bg-purple-500/20 flex items-center justify-center">
                    <FaCalendarDays className="w-6 h-6 text-purple-500 feature-icon" />
                  </div>
                  <h3 className="text-lg md:text-xl font-bold text-foreground">
                    Evenimente
                  </h3>
                  <p className="text-sm md:text-base text-muted-foreground text-pretty">
                    concerte, expoziții, workshop-uri, theatre nights, party-uri
                  </p>
                </div>
              </div>
            </section>

            {/* Beneficii (Benefits) */}
            <section className="space-y-6 md:space-y-8">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground text-center">
                Beneficii
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                <div className="glass-card p-4 md:p-6 space-y-4 rounded-lg">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <FaEye className="w-6 h-6 text-primary feature-icon" />
                  </div>
                  <h3 className="text-lg md:text-xl font-bold text-foreground">
                    Reach real
                  </h3>
                  <p className="text-sm md:text-base text-muted-foreground text-pretty">
                    public relevant, localizat
                  </p>
                </div>

                <div className="glass-card p-4 md:p-6 space-y-4 rounded-lg">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <FaShield className="w-6 h-6 text-primary feature-icon" />
                  </div>
                  <h3 className="text-lg md:text-xl font-bold text-foreground">
                    Control
                  </h3>
                  <p className="text-sm md:text-base text-muted-foreground text-pretty">
                    tu decizi regulile listării, programul și prețul
                  </p>
                </div>

                <div className="glass-card p-4 md:p-6 space-y-4 rounded-lg">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <FaAward className="w-6 h-6 text-primary feature-icon" />
                  </div>
                  <h3 className="text-lg md:text-xl font-bold text-foreground">
                    Instrumente utile
                  </h3>
                  <p className="text-sm md:text-base text-muted-foreground text-pretty">
                    mesagerie, recenzii, promovări, profil curat
                  </p>
                </div>

                <div className="glass-card p-4 md:p-6 space-y-4 rounded-lg">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <FaClock className="w-6 h-6 text-primary feature-icon" />
                  </div>
                  <h3 className="text-lg md:text-xl font-bold text-foreground">
                    Timp câștigat
                  </h3>
                  <p className="text-sm md:text-base text-muted-foreground text-pretty">
                    mai puțină alergătură, mai multe potriviri
                  </p>
                </div>
              </div>
            </section>

            {/* Tonul nostru (Our Tone) */}
            <section className="space-y-6 md:space-y-8">
              <div className="bg-linear-to-r from-primary/5 to-secondary/5 rounded-xl p-6 md:p-12 backdrop-blur-sm border border-border/50">
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground text-center mb-6 md:mb-8">
                  Tonul nostru (și promisiunea)
                </h2>

                <div className="max-w-3xl mx-auto space-y-4 md:space-y-6">
                  <p className="text-base sm:text-lg md:text-xl text-foreground leading-relaxed text-center font-medium">
                    Scriem puțin. Muncim mult.
                  </p>

                  <p className="text-base sm:text-lg md:text-xl text-foreground leading-relaxed text-center font-medium">
                    Păstrăm platforma rapidă, clară și cinstită.
                  </p>

                  <p className="text-base sm:text-lg md:text-xl text-foreground leading-relaxed text-center font-medium">
                    Construim pe termen lung, cu cei care livrează la fel.
                  </p>
                </div>
              </div>
            </section>

            {/* Link-uri utile (Useful Links) */}
            <section className="space-y-6 md:space-y-8">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground text-center">
                Link-uri utile
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 max-w-4xl mx-auto">
                <Link href="/termeni-si-conditii" className="group">
                  <div className="glass-card p-4 md:p-6 space-y-4 rounded-lg h-full">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                      <FaSquareCheck className="w-6 h-6 text-primary feature-icon" />
                    </div>
                    <h3 className="text-base md:text-lg font-bold text-foreground">
                      Termeni și condiții
                    </h3>
                  </div>
                </Link>

                <Link href="/politica-de-confidentialitate" className="group">
                  <div className="glass-card p-4 md:p-6 space-y-4 rounded-lg h-full">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                      <FaShield className="w-6 h-6 text-primary feature-icon" />
                    </div>
                    <h3 className="text-base md:text-lg font-bold text-foreground">
                      Politica de confidențialitate
                    </h3>
                  </div>
                </Link>

                <Link href="/politica-cookie" className="group">
                  <div className="glass-card p-4 md:p-6 space-y-4 rounded-lg h-full">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                      <FaInfo className="w-6 h-6 text-primary feature-icon" />
                    </div>
                    <h3 className="text-base md:text-lg font-bold text-foreground">
                      Politica de cookie
                    </h3>
                  </div>
                </Link>
              </div>
            </section>

            {/* FAQ Section */}
            <FAQSection />
          </div>
        </div>
      </div>
    </>
  );
}
