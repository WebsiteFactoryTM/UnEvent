import { Button, Heading, Section, Text } from "@react-email/components";
import * as React from "react";
import { EmailLayout } from "./Layout.js";

export interface AdminClaimPendingEmailProps {
  claimId: string;
  claimToken: string;
  listingTitle: string;
  listingType: string;
  listingId: string;
  claimantEmail: string;
  claimantName?: string;
  dashboardUrl?: string;
}

export function AdminClaimPendingEmail({
  claimId,
  claimToken,
  listingTitle,
  listingType,
  listingId,
  claimantEmail,
  claimantName,
  dashboardUrl,
}: AdminClaimPendingEmailProps) {
  const listingTypeLabel =
    listingType === "events"
      ? "eveniment"
      : listingType === "locations"
        ? "locație"
        : "serviciu";

  return (
    <EmailLayout
      preview={`O nouă cerere de revendicare pentru „${listingTitle}”`}
    >
      <Heading style={heading}>O nouă cerere de revendicare</Heading>
      <Text style={paragraph}>
        O nouă cerere de revendicare pentru <strong>{listingTypeLabel}</strong>{" "}
        a fost trimisă și așteaptă aprobarea ta.
      </Text>
      <Section style={infoBox}>
        <Text style={infoLabel}>Listare: {listingTitle}</Text>
        <Text style={infoLabel}>Tip: {listingTypeLabel}</Text>
        <Text style={infoLabel}>
          Solicitant: {claimantName || "N/A"} ({claimantEmail})
        </Text>
        <Text style={infoLabel}>ID cerere: {claimId}</Text>
        <Text style={infoLabel}>Token: {claimToken}</Text>
      </Section>
      {dashboardUrl && (
        <Section style={buttonContainer}>
          <Button style={button} href={dashboardUrl}>
            Revizuiește cererea
          </Button>
        </Section>
      )}
      <Text style={paragraphSmall}>
        Te rugăm să revizuiesti cererea cât mai curând posibil.
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

const infoValueSmall = {
  color: "#666666",
  fontSize: "12px",
  lineHeight: "18px",
  margin: "0 0 12px",
  fontFamily: "monospace",
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
