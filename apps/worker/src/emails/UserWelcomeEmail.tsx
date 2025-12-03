import { Button, Heading, Section, Text } from "@react-email/components";
import * as React from "react";
import { EmailLayout } from "./Layout.js";

export interface UserWelcomeEmailProps {
  firstName: string;
  confirmUrl: string;
  supportEmail?: string;
}

export function UserWelcomeEmail({
  firstName,
  confirmUrl,
  supportEmail = "contact@unevent.ro",
}: UserWelcomeEmailProps) {
  return (
    <EmailLayout preview="Bine ai venit la UN:EVENT — confirmă-ți emailul">
      <Heading style={heading}>
        Bine ai venit la <span style={{ fontWeight: 700 }}>UN:EVENT</span>
      </Heading>

      <Text style={paragraph}>Salut, {firstName || "acolo"}!</Text>

      <Text style={paragraph}>
        Te-ai înregistrat cu succes. Confirmă adresa de email pentru a-ți activa
        contul și a folosi toate funcționalitățile platformei.
      </Text>

      <Section style={buttonContainer}>
        <Button href={confirmUrl} style={button}>
          Confirmă emailul
        </Button>
      </Section>

      <Text style={paragraphSmall}>
        Dacă nu ai creat tu acest cont, poți ignora acest email sau ne poți
        scrie la {supportEmail}.
      </Text>

      <Text style={signature}>— Echipa UN:EVENT</Text>
    </EmailLayout>
  );
}

const heading = {
  color: "#000000",
  fontSize: "22px",
  fontWeight: 600,
  lineHeight: "28px",
  margin: "0 0 20px",
};

const paragraph = {
  color: "#000000",
  fontSize: "16px",
  lineHeight: "24px",
  margin: "0 0 16px",
};

const paragraphSmall = {
  color: "#4b4b4b",
  fontSize: "14px",
  lineHeight: "20px",
  margin: "0 0 12px",
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
  fontWeight: 600,
  textDecoration: "none",
  textAlign: "center" as const,
  display: "inline-block",
  padding: "12px 24px",
};

const signature = {
  color: "#000000",
  fontSize: "14px",
  lineHeight: "20px",
  margin: "24px 0 0",
};
