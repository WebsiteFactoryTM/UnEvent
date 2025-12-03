import { Button, Heading, Section, Text } from "@react-email/components";
import * as React from "react";
import { EmailLayout } from "./Layout.js";

export interface UserWelcomeClientEmailProps {
  firstName: string;
  dashboardUrl?: string;
  supportEmail?: string;
}

export function UserWelcomeClientEmail({
  firstName,
  dashboardUrl,
  supportEmail = "contact@unevent.com",
}: UserWelcomeClientEmailProps) {
  const defaultDashboardUrl = process.env.FRONTEND_URL || "https://unevent.com";
  
  return (
    <EmailLayout preview="Bine ai venit pe Unevent — descoperă evenimente și locații">
      <Heading style={heading}>
        Bine ai venit pe <span style={{ fontWeight: 700 }}>UN:EVENT</span>! 🎉
      </Heading>

      <Text style={paragraph}>Salut{firstName ? `, ${firstName}` : ""}!</Text>

      <Text style={paragraph}>
        Contul tău a fost verificat cu succes. Acum poți explora tot ce are Unevent de oferit!
      </Text>

      <Text style={paragraph}>
        <strong>Ce poți face pe platformă:</strong>
      </Text>

      <Text style={bulletPoint}>🎪 Descoperă evenimente din orașul tău</Text>
      <Text style={bulletPoint}>📍 Găsește locații pentru petreceri și evenimente</Text>
      <Text style={bulletPoint}>🛠️ Explorează servicii pentru organizarea evenimentelor</Text>
      <Text style={bulletPoint}>⭐ Salvează favoritele și lasă recenzii</Text>

      <Section style={buttonContainer}>
        <Button href={dashboardUrl || defaultDashboardUrl} style={button}>
          Explorează Platforma
        </Button>
      </Section>

      <Text style={paragraphSmall}>
        Dacă ai întrebări, nu ezita să ne scrii la {supportEmail}.
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

