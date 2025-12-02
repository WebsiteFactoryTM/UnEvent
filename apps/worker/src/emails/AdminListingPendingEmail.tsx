import { Button, Heading, Section, Text } from "@react-email/components";
import * as React from "react";
import { EmailLayout } from "./Layout.js";

export interface AdminListingPendingEmailProps {
  listingTitle: string;
  listingType: string;
  listingId: string;
  createdBy: string;
  dashboardUrl?: string;
}

export function AdminListingPendingEmail({
  listingTitle,
  listingType,
  listingId,
  createdBy,
  dashboardUrl,
}: AdminListingPendingEmailProps) {
  const listingTypeLabel =
    listingType === "events"
      ? "eveniment"
      : listingType === "locations"
        ? "locație"
        : "serviciu";

  return (
    <EmailLayout
      preview={`O listare nouă așteaptă aprobare: „${listingTitle}”`}
    >
      <Heading style={heading}>O listare nouă așteaptă aprobare</Heading>
      <Text style={paragraph}>
        O nouă listare de tip <strong>{listingTypeLabel}</strong> a fost creată
        și așteaptă aprobarea ta.
      </Text>
      <Section style={infoBox}>
        <Text style={infoLabel}>Titlu:</Text>
        <Text style={infoValue}>{listingTitle}</Text>
        <Text style={infoLabel}>Tip:</Text>
        <Text style={infoValue}>{listingTypeLabel}</Text>
        <Text style={infoLabel}>Creat de:</Text>
        <Text style={infoValue}>{createdBy}</Text>
        <Text style={infoLabel}>ID:</Text>
        <Text style={infoValue}>{listingId}</Text>
      </Section>
      {dashboardUrl && (
        <Section style={buttonContainer}>
          <Button style={button} href={dashboardUrl}>
            Revizuiește listarea
          </Button>
        </Section>
      )}
      <Text style={paragraphSmall}>
        Te rugăm să revizuiesti listarea cât mai curând posibil.
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
