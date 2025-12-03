import { Button, Heading, Section, Text } from "@react-email/components";
import * as React from "react";
import { EmailLayout } from "./Layout.js";

export interface UserWelcomeOrganizerEmailProps {
  firstName: string;
  dashboardUrl?: string;
  supportEmail?: string;
}

export function UserWelcomeOrganizerEmail({
  firstName,
  dashboardUrl,
  supportEmail = "contact@unevent.com",
}: UserWelcomeOrganizerEmailProps) {
  const defaultDashboardUrl = process.env.FRONTEND_URL
    ? `${process.env.FRONTEND_URL}/cont/evenimente-mele`
    : "https://unevent.com/cont/evenimente-mele";

  return (
    <EmailLayout preview="Publică primul tău eveniment">
      <Heading style={heading}>
        Ești Organizator pe <span style={{ fontWeight: 700 }}>UN:EVENT</span> ✅
      </Heading>

      <Text style={paragraph}>Salut{firstName ? `, ${firstName}` : ""}!</Text>

      <Text style={paragraph}>
        Rolul <strong>Organizator</strong> este activ.
      </Text>

      <Text style={paragraph}>
        Adaugă un eveniment cu dată, locație, descriere și media.
      </Text>

      <Text style={paragraph}>
        <strong>Cum să-ți crești vizibilitatea</strong>
      </Text>

      <Text style={bulletPoint}>
        • Adaugă titlu și descriere cât mai precise și locația exactă
      </Text>
      <Text style={bulletPoint}>• Adaugă + 4–6 imagini relevante</Text>
      <Text style={bulletPoint}>
        • Setează link spre achiziționare bilete ori opțiune "Intrare liberă"
      </Text>
      <Text style={bulletPoint}>• Adaugă date de contact</Text>

      <Section style={buttonContainer}>
        <Button href={dashboardUrl || defaultDashboardUrl} style={button}>
          Creează eveniment
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
