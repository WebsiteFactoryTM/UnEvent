import { Button, Heading, Section, Text } from "@react-email/components";
import * as React from "react";
import { EmailLayout } from "./Layout.js";

export interface UserWelcomeProviderEmailProps {
  firstName: string;
  dashboardUrl?: string;
  supportEmail?: string;
}

export function UserWelcomeProviderEmail({
  firstName,
  dashboardUrl,
  supportEmail = "contact@unevent.com",
}: UserWelcomeProviderEmailProps) {
  const defaultDashboardUrl = process.env.FRONTEND_URL
    ? `${process.env.FRONTEND_URL}/cont/servicii-mele`
    : "https://unevent.com/cont/servicii-mele";

  return (
    <EmailLayout preview="Creează primul pachet și apari în căutări">
      <Heading style={heading}>
        Ești Prestator Servicii pe{" "}
        <span style={{ fontWeight: 700 }}>UN:EVENT</span> ✅
      </Heading>

      <Text style={paragraph}>Salut{firstName ? `, ${firstName}` : ""}!</Text>

      <Text style={paragraph}>
        Ești <strong>Prestator servicii</strong> pe UN:EVENT.
      </Text>

      <Text style={paragraph}>
        <strong>4 idei ca să ieși în față</strong>
      </Text>

      <Text style={bulletPoint}>
        • Adaugă titlu și descriere cât mai precise
      </Text>
      <Text style={bulletPoint}>
        • Încarcă 6–10 foto servicii sau portofoliu
      </Text>
      <Text style={bulletPoint}>• Selectează orașul</Text>
      <Text style={bulletPoint}>• Adaugă date de contact</Text>

      <Section style={buttonContainer}>
        <Button href={dashboardUrl || defaultDashboardUrl} style={button}>
          Creează pachet
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
