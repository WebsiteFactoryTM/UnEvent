import { Button, Heading, Section, Text } from "@react-email/components";
import * as React from "react";
import { EmailLayout } from "./Layout.js";

export interface AdminUserNewEmailProps {
  userEmail: string;
  displayName?: string;
  userId: string;
  roles: string[];
  dashboardUrl?: string;
}

export function AdminUserNewEmail({
  userEmail,
  displayName,
  userId,
  roles,
  dashboardUrl,
}: AdminUserNewEmailProps) {
  const rolesLabel = roles.join(", ");

  return (
    <EmailLayout preview={`S-a înregistrat un nou utilizator: ${userEmail}`}>
      <Heading style={heading}>S-a înregistrat un nou utilizator</Heading>
      <Text style={paragraph}>
        Un nou utilizator s-a înregistrat în platformă și așteaptă verificarea
        ta.
      </Text>
      <Section style={infoBox}>
        <Text style={infoLabel}>Email:</Text>
        <Text style={infoValue}>{userEmail}</Text>
        {displayName && (
          <>
            <Text style={infoLabel}>Nume:</Text>
            <Text style={infoValue}>{displayName}</Text>
          </>
        )}
        <Text style={infoLabel}>Roluri:</Text>
        <Text style={infoValue}>{rolesLabel}</Text>
        <Text style={infoLabel}>ID:</Text>
        <Text style={infoValue}>{userId}</Text>
      </Section>
      {dashboardUrl && (
        <Section style={buttonContainer}>
          <Button style={button} href={dashboardUrl}>
            Vezi utilizatorul
          </Button>
        </Section>
      )}
      <Text style={paragraphSmall}>
        Verifică profilul utilizatorului și asigură-te că totul este în regulă.
      </Text>
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

const infoBox = {
  backgroundColor: "#f5f5f5",
  borderLeft: "3px solid #000000",
  padding: "16px",
  margin: "20px 0",
};

const infoLabel = {
  color: "#666666",
  fontSize: "14px",
  fontWeight: 600,
  lineHeight: "20px",
  margin: "8px 0 4px",
};

const infoValue = {
  color: "#000000",
  fontSize: "16px",
  lineHeight: "24px",
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

const paragraphSmall = {
  color: "#666666",
  fontSize: "14px",
  lineHeight: "20px",
  margin: "20px 0 0",
};
