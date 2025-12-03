import { Button, Heading, Section, Text } from "@react-email/components";
import * as React from "react";
import { EmailLayout } from "./Layout.js";

export interface UserWelcomeHostEmailProps {
  firstName: string;
  dashboardUrl?: string;
  supportEmail?: string;
}

export function UserWelcomeHostEmail({
  firstName,
  dashboardUrl,
  supportEmail = "contact@unevent.com",
}: UserWelcomeHostEmailProps) {
  const defaultDashboardUrl = process.env.FRONTEND_URL
    ? `${process.env.FRONTEND_URL}/cont/locatii-mele`
    : "https://unevent.com/cont/locatii-mele";

  return (
    <EmailLayout preview="Publică prima ta locație în 2 minute">
      <Heading style={heading}>
        Ești Gazdă pe <span style={{ fontWeight: 700 }}>UN:EVENT</span> ✅
      </Heading>

      <Text style={paragraph}>Salut{firstName ? `, ${firstName}` : ""}!</Text>

      <Text style={paragraph}>
        Ți-am activat rolul <strong>Gazdă</strong>.
      </Text>

      <Text style={paragraph}>
        <strong>4 pași rapizi ca să atragi rezervări</strong>
      </Text>

      <Text style={paragraph}>Iată cum să pornești:</Text>

      <Text style={bulletPoint}>• Încarcă 8–10 poze luminoase</Text>
      <Text style={bulletPoint}>
        • Adaugă titlu locație, descriere, capacitate, dotări
      </Text>
      <Text style={bulletPoint}>• Marchează precis adresa pe hartă</Text>
      <Text style={bulletPoint}>• Adaugă date de contact</Text>

      <Text style={paragraph}>
        Listează-ți acum locația și primește cereri.
      </Text>

      <Section style={buttonContainer}>
        <Button href={dashboardUrl || defaultDashboardUrl} style={button}>
          Adaugă locație
        </Button>
      </Section>

      <Text style={paragraphSmall}>
        Ai întrebări? Scrie-ne la {supportEmail}.
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

const bulletPoint = {
  color: "#000000",
  fontSize: "16px",
  lineHeight: "24px",
  margin: "0 0 8px",
  paddingLeft: "20px",
};

const paragraphSmall = {
  color: "#4b4b4b",
  fontSize: "14px",
  lineHeight: "20px",
  margin: "24px 0 12px",
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
