import { Button, Heading, Section, Text } from "@react-email/components";
import * as React from "react";
import { EmailLayout } from "./Layout.js";

export interface EventReminderEmailProps {
  eventTitle: string;
  eventDate: string;
  eventId: string;
  eventUrl?: string;
}

export function EventReminderEmail({
  eventTitle,
  eventDate,
  eventId,
  eventUrl,
}: EventReminderEmailProps) {
  const formattedDate = new Date(eventDate).toLocaleString("ro-RO", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <EmailLayout preview={`Reminder: ${eventTitle} is tomorrow`}>
      <Heading style={heading}>Reminder: {eventTitle}</Heading>
      <Text style={paragraph}>
        Acest eveniment are loc mâine, {formattedDate}.
      </Text>
      <Text style={paragraph}>
        Nu uita să participi la <strong>{eventTitle}</strong>.
      </Text>
      {eventUrl && (
        <Section style={buttonContainer}>
          <Button style={button} href={eventUrl}>
            Vezi detalii eveniment
          </Button>
        </Section>
      )}
      <Text style={paragraph}>
        Dacă nu mai poți participa, te rugăm să anulezi participarea.
      </Text>
    </EmailLayout>
  );
}

const heading = {
  color: "#000000",
  fontSize: "20px",
  fontWeight: "600",
  lineHeight: "24px",
  margin: "0 0 20px",
};

const paragraph = {
  color: "#000000",
  fontSize: "16px",
  lineHeight: "24px",
  margin: "0 0 16px",
};

const buttonContainer = {
  padding: "20px 0",
  textAlign: "center" as const,
};

const button = {
  backgroundColor: "#000000",
  borderRadius: "4px",
  color: "#ffffff",
  fontSize: "16px",
  fontWeight: "600",
  textDecoration: "none",
  textAlign: "center" as const,
  display: "inline-block",
  padding: "12px 24px",
};
