import { Heading, Section, Text } from "@react-email/components";
import * as React from "react";
import { EmailLayout } from "./Layout.js";

export interface ClaimRejectedEmailProps {
  firstName: string;
  listingTitle: string;
  listingType: string;
  listingId: string;
  reason?: string;
  supportEmail?: string;
  claimId: string;
}

export function ClaimRejectedEmail({
  firstName,
  listingTitle,
  listingType,
  listingId,
  reason,
  supportEmail,
  claimId,
}: ClaimRejectedEmailProps) {
  const listingTypeLabel =
    listingType === "events"
      ? "evenimentul"
      : listingType === "locations"
        ? "locația"
        : "serviciul";

  return (
    <EmailLayout
      preview={`Cererea ta de revendicare pentru „${listingTitle}” a fost respinsă`}
    >
      <Heading style={heading}>Cererea ta a fost respinsă</Heading>
      <Text style={paragraph}>Salut{firstName ? `, ${firstName}` : ""}!</Text>
      <Text style={paragraph}>
        Ne pare rău să te anunțăm că cererea ta de revendicare pentru{" "}
        <strong>„{listingTitle}”</strong> a fost respinsă.
      </Text>
      {reason && (
        <Section style={infoBox}>
          <Text style={infoLabel}>Motiv: {reason}</Text>
        </Section>
      )}
      <Text style={paragraph}>
        Dacă consideri că această decizie este incorectă sau dacă ai întrebări,
        te rugăm să ne contactezi.
      </Text>
      {supportEmail && (
        <Text style={paragraph}>
          Email suport:{" "}
          <a href={`mailto:${supportEmail}`} style={link}>
            {supportEmail}
          </a>
        </Text>
      )}
      <Text style={paragraphSmall}>Mulțumim pentru înțelegere.</Text>
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
  borderLeft: "3px solid #cc0000",
  padding: "16px",
  margin: "20px 0",
};

const infoLabel = {
  color: "#666666",
  fontSize: "14px",
  fontWeight: 600,
  lineHeight: "20px",
  margin: "0 0 8px",
};

const infoValue = {
  color: "#000000",
  fontSize: "16px",
  lineHeight: "24px",
  margin: "0",
};

const paragraphSmall = {
  color: "#666666",
  fontSize: "14px",
  lineHeight: "20px",
  margin: "20px 0 0",
};

const link = {
  color: "#000000",
  textDecoration: "underline",
};
