import { Button, Heading, Section, Text } from "@react-email/components";
import * as React from "react";
import { EmailLayout } from "./Layout.js";

export interface ListingRejectedEmailProps {
  firstName: string;
  listingTitle: string;
  listingType: string;
  listingId: string;
  reason?: string;
  listingUrl?: string;
  supportEmail?: string;
}

export function ListingRejectedEmail({
  firstName,
  listingTitle,
  listingType,
  listingId,
  reason,
  listingUrl,
  supportEmail = "contact@unevent.ro",
}: ListingRejectedEmailProps) {
  const listingTypeLabel =
    listingType === "events"
      ? "eveniment"
      : listingType === "locations"
        ? "locație"
        : "serviciu";

  return (
    <EmailLayout preview={`Listarea ta „${listingTitle}” a fost respinsă`}>
      <Heading style={heading}>Listarea ta a fost respinsă</Heading>
      <Text style={paragraph}>Salut, {firstName}!</Text>
      <Text style={paragraph}>
        Ne pare rău să te anunțăm că listarea ta{" "}
        <strong>„{listingTitle}”</strong> a fost respinsă.
      </Text>
      {reason && (
        <Section style={reasonBox}>
          <Text style={reasonLabel}>Motivul respingerii:</Text>
          <Text style={reasonText}>{reason}</Text>
        </Section>
      )}
      <Text style={paragraph}>
        Poți să editezi listarea și să o resubmiți pentru revizuire. Dacă ai
        întrebări sau ai nevoie de clarificări, te rugăm să ne contactezi.
      </Text>
      {listingUrl && (
        <Section style={buttonContainer}>
          <Button style={button} href={listingUrl}>
            Editează listarea
          </Button>
        </Section>
      )}
      <Text style={paragraph}>
        Pentru suport, contactează-ne la{" "}
        <a href={`mailto:${supportEmail}`} style={link}>
          {supportEmail}
        </a>
        .
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

const reasonBox = {
  backgroundColor: "#f5f5f5",
  borderLeft: "3px solid #000000",
  padding: "16px",
  margin: "20px 0",
};

const reasonLabel = {
  color: "#000000",
  fontSize: "14px",
  fontWeight: 600,
  lineHeight: "20px",
  margin: "0 0 8px",
};

const reasonText = {
  color: "#000000",
  fontSize: "16px",
  lineHeight: "24px",
  margin: "0",
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
const link = {
  color: "#000000",
  textDecoration: "underline",
};
