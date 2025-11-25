"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa6";
import Image from "next/image";

const slides = [
  {
    title: "Un loc pentru orice moment",
    description:
      "Filtrezi după oraș, tip de locație, dată și capacitate; vezi fotografii, hartă și detalii transparente despre preț. Compari rapid opțiunile, salvezi favoritele și găsești ce îți trebuie în câteva clicuri.",
  },
  {
    title: "Căutare inteligentă, rezultate relevante",
    description:
      "Accesezi spații unice care nu apar pe platformele clasice de închiriere. Pentru workshop, petrecere privată sau expoziție, găsești locații potrivite exact pe nevoile tale, în cartierele dorite și la bugetul tău.",
  },
  {
    title: "Furnizori verificați, gata de eveniment",
    description:
      "Găsești furnizori verificați pentru orice eveniment: DJ, trupe, foto-video, catering, organizatori. Citești ratinguri și review-uri, contactezi direct, ceri oferte și alegi echipa potrivită fără intermediari.",
  },
];

export function AboutSlider() {
  const [currentSlide, setCurrentSlide] = useState(0);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  return (
    <section className="w-screen mx-auto px-4 py-16 bg-muted/30">
      <div className="max-w-7xl mx-auto">
        <div className="glass-card overflow-hidden">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div className="relative aspect-square order-1 md:order-2">
              <Image
                src="/assets/inchiriere-spatiu-aniversare-1024x1024.webp"
                alt="Despre UN:EVENT"
                fill
                className="object-cover rounded-lg"
              />
            </div>

            <div className="p-8 md:p-12 space-y-6 order-1 md:order-2">
              <div className="space-y-4 min-h-[200px]">
                <h2 className="text-3xl md:text-4xl font-bold">
                  {slides[currentSlide].title}
                </h2>
                <p className="text-lg text-muted-foreground">
                  {slides[currentSlide].description}
                </p>
              </div>

              <div className="flex items-center gap-4">
                <div className="flex gap-2">
                  <Button
                    size="icon"
                    variant="outline"
                    onClick={prevSlide}
                    className="glass-card bg-transparent"
                    aria-label="Slide anterior"
                  >
                    {FaChevronLeft({ className: "h-4 w-4" })}
                  </Button>
                  <Button
                    size="icon"
                    variant="outline"
                    onClick={nextSlide}
                    className="glass-card bg-transparent"
                    aria-label="Slide următor"
                  >
                    {FaChevronRight({ className: "h-4 w-4" })}
                  </Button>
                </div>

                <div className="flex gap-2">
                  {slides.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentSlide(index)}
                      className={`h-2 rounded-full transition-all ${
                        index === currentSlide
                          ? "w-8 bg-primary"
                          : "w-2 bg-muted-foreground/30"
                      }`}
                      aria-label={`Mergi la slide ${index + 1}`}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
