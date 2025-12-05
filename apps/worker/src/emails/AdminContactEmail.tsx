import { Button, Heading, Section, Text } from "@react-email/components";
import * as React from "react";
import { EmailLayout } from "./Layout.js";

export interface AdminContactEmailProps {
  senderName: string;
  senderEmail: string;
  senderPhone: string;
  subject: string;
  message: string;
  submittedAt?: string;
}

export function AdminContactEmail({
  senderName,
  senderEmail,
  senderPhone,
  subject,
  message,
  submittedAt,
}: AdminContactEmailProps) {
  // Format timestamp if provided
  const formattedDate = submittedAt
    ? new Date(submittedAt).toLocaleString("ro-RO", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : undefined;

  return (
    <EmailLayout preview={`Mesaj nou de contact de la ${senderName}`}>
      <Heading style={heading}>Mesaj nou de contact</Heading>
      <Text style={paragraph}>
        Un nou mesaj de contact a fost primit prin formularul de pe site.
      </Text>

      <Section style={infoBox}>
        <Text style={infoLabel}>Nume: {senderName}</Text>

        <Text style={infoLabel}>Email: {senderEmail}</Text>
        <Text style={infoLabel}>Telefon: {senderPhone}</Text>
        <Text style={infoLabel}>Subiect: {subject}</Text>
      </Section>

      <Section style={messageBox}>
        <Text style={messageLabel}>Mesaj:</Text>
        <Text style={messageText}>{message}</Text>
      </Section>

      {formattedDate && (
        <Text style={paragraphSmall}>Trimis pe: {formattedDate}</Text>
      )}

      <Section style={buttonContainer}>
        <Button style={button} href={`mailto:${senderEmail}`}>
          Răspunde la mesaj
        </Button>
      </Section>
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

const emailLink = {
  color: "#000000",
  textDecoration: "underline",
};

const messageBox = {
  backgroundColor: "#ffffff",
  border: "1px solid #e5e5e5",
  borderRadius: "4px",
  padding: "16px",
  margin: "20px 0",
};

const messageLabel = {
  color: "#666666",
  fontSize: "14px",
  fontWeight: 600,
  lineHeight: "20px",
  margin: "0 0 8px",
};

const messageText = {
  color: "#000000",
  fontSize: "16px",
  lineHeight: "24px",
  margin: "0",
  whiteSpace: "pre-wrap" as const,
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
