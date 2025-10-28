"use client"

import { useState } from "react"
import { FaChevronDown } from "react-icons/fa6"
import { Card, CardContent } from "@/components/ui/card"

interface FAQItem {
  question: string
  answer: string
}

const faqData: FAQItem[] = [
  {
    question: "UN:EVENT organizează evenimente?",
    answer: "Nu. Suntem intermediar: listăm, conectăm, promovăm.",
  },
  {
    question: "Verificați voi avizele/ISU?",
    answer: "Nu. Verificarea conformității revine gazdelor/prestatorilor și organizatorilor.",
  },
  {
    question: "Pot promova listarea?",
    answer: "Da — featured, top-search, bannere sau abonamente.",
  },
  {
    question: "Pot lista ca persoană juridică?",
    answer:
      "Da. La nevoie, putem cere CI administrator, și dovada reprezentării companiei (strict pentru validare și siguranță).",
  },
]

export function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index)
  }

  return (
    <section className="space-y-8">
      <h2 className="text-3xl md:text-4xl font-bold text-foreground text-center">Mic FAQ</h2>

      <div className="max-w-3xl mx-auto space-y-4">
        {faqData.map((faq, index) => (
          <Card
            key={index}
            className="bg-white/10 backdrop-blur-sm border border-white/20 overflow-hidden transition-all"
          >
            <button
              onClick={() => toggleFAQ(index)}
              className="w-full text-left p-6 flex items-center justify-between gap-4 hover:bg-white/5 transition-colors"
              aria-expanded={openIndex === index}
            >
              <h3 className="text-lg font-semibold text-foreground">{faq.question}</h3>
              <FaChevronDown
                className={`w-5 h-5 text-muted-foreground transition-transform flex-shrink-0 ${
                  openIndex === index ? "rotate-180" : ""
                }`}
              />
            </button>

            <div
              className={`transition-all duration-300 ease-in-out ${
                openIndex === index ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
              } overflow-hidden`}
            >
              <CardContent className="px-6 pb-6 pt-0">
                <p className="text-muted-foreground leading-relaxed">{faq.answer}</p>
              </CardContent>
            </div>
          </Card>
        ))}
      </div>
    </section>
  )
}
