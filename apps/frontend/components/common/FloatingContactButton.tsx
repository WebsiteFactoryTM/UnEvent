"use client";

import React from "react";
import { MessageCircle } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";

const WHATSAPP_NUMBER = "40739653700";
const WEBSITE_URL = "unevent.ro";

const CONTACT_OPTIONS = [
  {
    label: "Intrebare generală",
    message: `Bună! Vin de pe UnEvent (${WEBSITE_URL}) și am o întrebare generală.`,
  },
  {
    label: "Raportare eroare",
    message: `Bună! Raportez o eroare pe UnEvent (${WEBSITE_URL}).`,
  },
] as const;

function generateWhatsAppLink(message: string): string {
  const encodedMessage = encodeURIComponent(message);
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodedMessage}`;
}

export function FloatingContactButton() {
  const handleOptionClick = (message: string) => {
    const link = generateWhatsAppLink(message);
    window.open(link, "_blank", "noopener,noreferrer");
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          size="icon"
          className="fixed bottom-4 right-4 z-40 h-14 w-14 rounded-full bg-foreground text-background border border-border shadow-lg opacity-80 hover:opacity-100 hover:bg-foreground/90 dark:hover:bg-foreground/80 hover:shadow-xl transition-all duration-200 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none"
          aria-label="Contactează-ne"
        >
          <MessageCircle className="h-6 w-6" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        side="top"
        align="end"
        sideOffset={12}
        className="w-56 p-0"
      >
        <div className="px-4 py-3 border-b border-border">
          <h3 className="text-sm font-semibold text-foreground">
            Ai nevoie de ajutor?
          </h3>
        </div>
        <div className="flex flex-col gap-1 p-2">
          {CONTACT_OPTIONS.map((option) => (
            <button
              key={option.label}
              onClick={() => handleOptionClick(option.message)}
              className="flex items-center gap-2 rounded-sm px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground transition-colors text-left w-full"
            >
              <span>{option.label}</span>
            </button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}
