import { Heading, Section, Text } from "@react-email/components";
import * as React from "react";
import { EmailLayout } from "./Layout.js";

export interface AdminDailyDigestEmailProps {
  date: string;
  stats?: {
    newEvents?: number;
    newReviews?: number;
    newUsers?: number;
    pendingModerations?: number;
  };
}

export function AdminDailyDigestEmail({
  date,
  stats = {},
}: AdminDailyDigestEmailProps) {
  const {
    newEvents = 0,
    newReviews = 0,
    newUsers = 0,
    pendingModerations = 0,
  } = stats;

  return (
    <EmailLayout preview={`Daily Admin Digest - ${date}`}>
      <Heading style={heading}>Daily Admin Digest</Heading>
      <Text style={paragraph}>Rezumatul zilnic pentru {date}</Text>

      <Section style={statsSection}>
        <Text style={statLabel}>Evenimente noi:</Text>
        <Text style={statValue}>{newEvents}</Text>
      </Section>

      <Section style={statsSection}>
        <Text style={statLabel}>Recenzii noi:</Text>
        <Text style={statValue}>{newReviews}</Text>
      </Section>

      <Section style={statsSection}>
        <Text style={statLabel}>Utilizatori noi:</Text>
        <Text style={statValue}>{newUsers}</Text>
      </Section>

      <Section style={statsSection}>
        <Text style={statLabel}>Moderări în așteptare:</Text>
        <Text style={statValue}>{pendingModerations}</Text>
      </Section>

      {newEvents === 0 &&
        newReviews === 0 &&
        newUsers === 0 &&
        pendingModerations === 0 && (
          <Text style={paragraph}>
            Nu au fost activități noi în ultimele 24 de ore.
          </Text>
        )}

      <Text style={note}>
        <strong>Notă:</strong> Aceste statistici sunt placeholder. Implementarea
        reală va conecta la Payload Local API pentru a obține datele actuale.
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

const statsSection = {
  borderBottom: "1px solid #e5e5e5",
  padding: "12px 0",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
};

const statLabel = {
  color: "#000000",
  fontSize: "16px",
  lineHeight: "24px",
  margin: "0",
  fontWeight: "500",
};

const statValue = {
  color: "#000000",
  fontSize: "20px",
  lineHeight: "24px",
  margin: "0",
  fontWeight: "600",
};

const note = {
  color: "#666666",
  fontSize: "14px",
  lineHeight: "20px",
  margin: "20px 0 0",
  fontStyle: "italic" as const,
};
