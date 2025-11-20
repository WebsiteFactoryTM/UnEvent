"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { FaLocationDot, FaWrench, FaCalendarDays } from "react-icons/fa6";

export function CTAInline() {
  return (
    <section className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto glass-card p-6 md:p-8">
        <div className="text-center space-y-6">
          <p className="text-lg text-muted-foreground">
            Ai o locație sau oferi servicii? Listează-te gratuit și fii găsit de
            organizatori:
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="glow-on-hover">
              <Link href="/cont/locatiile-mele/adauga">
                <FaLocationDot className="mr-2 h-5 w-5" />
                Listează o locație
              </Link>
            </Button>

            <Button
              asChild
              size="lg"
              variant="outline"
              className="glow-on-hover bg-transparent"
            >
              <Link href="/cont/serviciile-mele/adauga">
                <FaWrench className="mr-2 h-5 w-5" />
                Listează servicii
              </Link>
            </Button>

            <Button
              asChild
              size="lg"
              variant="outline"
              className="glow-on-hover bg-transparent"
            >
              <Link href="/cont/evenimentele-mele/adauga">
                <FaCalendarDays className="mr-2 h-5 w-5" />
                Adaugă eveniment
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
