import { Button, Heading, Section, Text } from "@react-email/components";
import * as React from "react";
import { EmailLayout } from "./Layout.js";

export interface AdminReviewPendingEmailProps {
  listingTitle: string;
  listingType: string;
  reviewerName: string;
  rating: number;
  reviewId: string;
  dashboardUrl?: string;
}

export function AdminReviewPendingEmail({
  listingTitle,
  listingType,
  reviewerName,
  rating,
  reviewId,
  dashboardUrl,
}: AdminReviewPendingEmailProps) {
  const listingTypeLabel =
    listingType === "events"
      ? "eveniment"
      : listingType === "locations"
        ? "locație"
        : "serviciu";

  const stars = "⭐".repeat(rating);

  return (
    <EmailLayout
      preview={`O recenzie nouă așteaptă aprobare pentru „${listingTitle}”`}
    >
      <Heading style={heading}>O recenzie nouă așteaptă aprobare</Heading>
      <Text style={paragraph}>
        O nouă recenzie pentru <strong>„{listingTitle}”</strong> a fost creată
        și așteaptă aprobarea ta.
      </Text>
      <Section style={infoBox}>
        <Text style={infoLabel}>Listare:</Text>
        <Text style={infoValue}>
          {listingTitle} ({listingTypeLabel})
        </Text>
        <Text style={infoLabel}>Recenzent:</Text>
        <Text style={infoValue}>{reviewerName}</Text>
        <Text style={infoLabel}>Rating:</Text>
        <Text style={infoValue}>
          {stars} ({rating}/5)
        </Text>
        <Text style={infoLabel}>ID recenzie:</Text>
        <Text style={infoValue}>{reviewId}</Text>
      </Section>
      {dashboardUrl && (
        <Section style={buttonContainer}>
          <Button style={button} href={dashboardUrl}>
            Revizuiește recenzia
          </Button>
        </Section>
      )}
      <Text style={paragraphSmall}>
        Te rugăm să revizuiesti recenzia cât mai curând posibil.
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
