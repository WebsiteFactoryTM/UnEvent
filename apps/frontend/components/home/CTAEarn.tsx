"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { FaArrowRight } from "react-icons/fa6"
import Image from "next/image"

export function CTAEarn() {
  return (
    <section className="container mx-auto px-4 py-16">
      <div className="max-w-7xl mx-auto">
        <div className="glass-card overflow-hidden">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div className="p-8 md:p-12 space-y-6 order-2 md:order-1">
              <p className="text-sm font-semibold text-primary uppercase tracking-wide">Pune-ți locația la treabă</p>
              <h2 className="text-3xl md:text-4xl font-bold">Câștigă un venit suplimentar</h2>
              <p className="text-lg text-muted-foreground">
                Transformă-ți spațiul într-o oportunitate de a inspira și a aduce oameni împreună. Deschide ușile către
                întâlniri și evenimente speciale din comunitatea ta.
              </p>
              <Button asChild size="lg" className="glow-on-hover">
                <Link href="/cont/locatiile-mele/">
                  Listează-ți locația
                  {FaArrowRight({ className: "ml-2 h-4 w-4" })}
                </Link>
              </Button>
            </div>

            <div className="relative aspect-square order-1 md:order-2">
              <Image src="/assets/locatii-evenimente-timisoara-listare-1024x1024.webp" alt="Locație pentru evenimente" fill className="object-cover rounded-lg" />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
