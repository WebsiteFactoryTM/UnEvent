import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  FaLocationDot,
  FaWrench,
  FaCalendarDays,
  FaTrophy,
  FaCheck,
} from "react-icons/fa6";
import { RegulamentAccordion } from "./RegulamentAccordion";

export const metadata: Metadata = {
  title: "Promoție de Crăciun - Câștigă Status Recomandat pe Viață | UN:EVENT",
  description:
    "Sărbătorește lansarea UN:EVENT! Câștigă Status Recomandat pe viață pentru locația, serviciul sau evenimentul tău. Extragere pe 24 Decembrie 2025. Listează-te acum!",
  keywords: [
    "promoție crăciun",
    "status recomandat",
    "unevent",
    "locații evenimente",
    "servicii evenimente",
    "evenimente România",
    "tombolă",
    "premii",
  ],
  openGraph: {
    title:
      "Promoție de Crăciun - Câștigă Status Recomandat pe Viață | UN:EVENT",
    description:
      "Sărbătorește lansarea UN:EVENT! Câștigă Status Recomandat pe viață. Extragere pe 24 Decembrie 2025.",
    type: "website",
  },
};

export default function PromotieDeCraciunPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative min-h-[70vh] flex flex-col items-center justify-center overflow-hidden bg-linear-to-br from-primary/50 via-background to-primary/50 py-8 sm:py-16 md:py-24">
        <div className="absolute inset-0 bg-[url('/x-mas-party.webp')] bg-cover bg-center opacity-40 dark:opacity-60" />

        <div className="relative z-10 container mx-auto px-4 py-4  sm:py-8 md:py-16 flex flex-col items-center justify-center max-w-6xl text-center space-y-2 md:space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-semibold mb-4">
            <FaTrophy className="h-4 w-4" />
            <span>Campanie Promoțională</span>
          </div>

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground leading-tight">
            Câștigă vizibilitate maximă pe UN:EVENT — PE VIAȚĂ!
          </h1>

          <p className="text-lg md:text-xl lg:text-2xl text-muted-foreground max-w-4xl mx-auto leading-relaxed">
            Platforma UN:EVENT a decolat. Sărbătorim lansarea cu cel mai valoros
            cadou pentru afacerea ta:{" "}
            <span className="font-semibold text-foreground">
              Statusul RECOMANDAT gratuit, pentru totdeauna.
            </span>
          </p>

          <p className="text-base md:text-lg text-muted-foreground max-w-3xl mx-auto">
            Prin listarea locației, a serviciului ori a evenimentului tău intri
            automat în extragere.
          </p>

          <Button asChild size="lg" className="glow-on-hover mt-4">
            <Link href="/auth/inregistrare">Listează-ți afacerea</Link>
          </Button>
        </div>
      </section>

      {/* Premiul Section */}
      <section className="container mx-auto px-4 py-16 md:py-24">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
              Ce punem la bătaie de Crăciun?
            </h2>
            <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto">
              Pe 24 Decembrie, extragem 15 parteneri norocoși care nu vor plăti
              niciodată pentru a fi printre primii în căutări în fața
              clienților.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mb-12">
            <div className="glass-card p-6 md:p-8 text-center space-y-4">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 border border-primary/20 mb-4">
                <FaLocationDot className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-2xl font-bold">5 x LOCAȚII</h3>
              <p className="text-muted-foreground">cu status Recomandat</p>
            </div>

            <div className="glass-card p-6 md:p-8 text-center space-y-4">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 border border-primary/20 mb-4">
                <FaWrench className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-2xl font-bold">5 x SERVICII</h3>
              <p className="text-muted-foreground">cu status Recomandat</p>
            </div>

            <div className="glass-card p-6 md:p-8 text-center space-y-4">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 border border-primary/20 mb-4">
                <FaCalendarDays className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-2xl font-bold">5 x EVENIMENTE</h3>
              <p className="text-muted-foreground">cu status Recomandat</p>
            </div>
          </div>

          <div className="glass-card p-6 md:p-8 space-y-6">
            <h3 className="text-2xl font-bold text-center mb-6">
              Ce înseamnă „Status Recomandat pe Viață"?
            </h3>

            <div className="grid md:grid-cols-3 gap-6">
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <FaCheck className="h-6 w-6 text-primary mt-1 shrink-0" />
                  <div>
                    <h4 className="font-semibold mb-1">Top Search</h4>
                    <p className="text-sm text-muted-foreground">
                      Apari mereu în primele rezultate când clienții caută în
                      categoria ta.
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <FaCheck className="h-6 w-6 text-primary mt-1 shrink-0" />
                  <div>
                    <h4 className="font-semibold mb-1">Badge Oficial</h4>
                    <p className="text-sm text-muted-foreground">
                      Profilul tău va avea insigna „Recomandat", inspirând
                      încredere.
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <FaCheck className="h-6 w-6 text-primary mt-1 shrink-0" />
                  <div>
                    <h4 className="font-semibold mb-1">0 Costuri</h4>
                    <p className="text-sm text-muted-foreground">
                      Valoarea este inestimabilă, costul tău este zero.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Mecanism Section */}
      <section className="w-screen mx-auto px-4 py-16 md:py-24 bg-muted/30">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
              Ești la 3 pași de premiu
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="glass-card p-6 md:p-8 space-y-4 relative">
              <div className="absolute -top-4 -left-4 w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-xl border-4 border-background">
                1
              </div>
              <h3 className="text-xl font-bold mt-4">Creează cont</h3>
              <p className="text-muted-foreground">
                Intră pe platformă și fă-ți un cont de Gazdă, Furnizor servicii
                sau Organizator evenimente – sau toate 3. (durează 1 minut).
              </p>
              <Button asChild variant="default" className="w-full mt-4">
                <Link href="/auth/inregistrare">Creează cont</Link>
              </Button>
            </div>

            <div className="glass-card p-6 md:p-8 space-y-4 relative">
              <div className="absolute -top-4 -left-4 w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-xl border-4 border-background">
                2
              </div>
              <h3 className="text-xl font-bold mt-4">Listează-te</h3>
              <p className="text-muted-foreground">
                Adaugă locația, serviciul sau evenimentul tău pe UN:EVENT.
                Completează profilul cu poze și detalii.
              </p>
              <div className="flex flex-col gap-2 mt-4">
                <Button asChild variant="default" size="sm" className="w-full">
                  <Link href="/cont/locatiile-mele/adauga">
                    Listează locație
                  </Link>
                </Button>
                <Button
                  asChild
                  variant="secondary"
                  size="sm"
                  className="w-full"
                >
                  <Link href="/cont/serviciile-mele/adauga">
                    Listează serviciu
                  </Link>
                </Button>
                <Button
                  asChild
                  variant="secondary"
                  size="sm"
                  className="w-full"
                >
                  <Link href="/cont/evenimentele-mele/adauga">
                    Adaugă eveniment
                  </Link>
                </Button>
              </div>
            </div>

            <div className="glass-card p-6 md:p-8 space-y-4 relative">
              <div className="absolute -top-4 -left-4 w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-xl border-4 border-background">
                3
              </div>
              <h3 className="text-xl font-bold mt-4">Așteaptă extragerea</h3>
              <p className="text-muted-foreground">
                Odată listat activ, intri automat în tombola din 24 Decembrie.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Despre Noi Section */}
      <section className="container mx-auto px-4 py-16 md:py-24">
        <div className="max-w-4xl mx-auto">
          <div className="glass-card p-6 md:p-8 lg:p-12 text-center space-y-6">
            <h2 className="text-3xl md:text-4xl font-bold">De ce UN:EVENT?</h2>
            <p className="text-lg md:text-xl text-muted-foreground leading-relaxed">
              Suntem cea mai nouă platformă dedicată industriei de evenimente
              din România. Conectăm organizatorii cu locațiile și furnizorii de
              top, simplu și transparent. Chiar dacă nu câștigi tombola,
              listarea pe UN:EVENT îți poate aduce clienți.
            </p>
            <Button asChild size="lg" className="glow-on-hover mt-4">
              <Link href="/auth/inregistrare">Începe acum</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Regulament Section */}
      <section className="w-screen mx-auto px-4 py-16 md:py-24 bg-muted/30">
        <div className="max-w-4xl mx-auto">
          <RegulamentAccordion />
        </div>
      </section>

      {/* Final CTA */}
      <section className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto text-center">
          <div className="glass-card p-8 md:p-12 space-y-6">
            <h2 className="text-3xl md:text-4xl font-bold">
              Nu rata șansa de a câștiga vizibilitate pe viață!
            </h2>
            <p className="text-lg text-muted-foreground">
              Listează-ți afacerea acum și intră în extragere.
            </p>
            <Button asChild size="lg" className="glow-on-hover">
              <Link href="/auth/inregistrare">Listează-ți afacerea acum</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
