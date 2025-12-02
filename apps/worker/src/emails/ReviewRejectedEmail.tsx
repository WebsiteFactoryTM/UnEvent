import { Heading, Section, Text } from "@react-email/components";
import * as React from "react";
import { EmailLayout } from "./Layout.js";

export interface ReviewRejectedEmailProps {
  firstName: string;
  listingTitle: string;
  listingType: string;
  reason?: string;
  supportEmail?: string;
}

export function ReviewRejectedEmail({
  firstName,
  listingTitle,
  listingType,
  reason,
  supportEmail = "support@unevent.com",
}: ReviewRejectedEmailProps) {
  return (
    <EmailLayout
      preview={`Recenzia ta pentru „${listingTitle}” a fost respinsă`}
    >
      <Heading style={heading}>Recenzia ta a fost respinsă</Heading>
      <Text style={paragraph}>Salut, {firstName}!</Text>
      <Text style={paragraph}>
        Ne pare rău să te anunțăm că recenzia ta pentru{" "}
        <strong>„{listingTitle}”</strong> a fost respinsă.
      </Text>
      {reason && (
        <Section style={reasonBox}>
          <Text style={reasonLabel}>Motivul respingerii:</Text>
          <Text style={reasonText}>{reason}</Text>
        </Section>
      )}
      <Text style={paragraph}>
        Poți să scrii o nouă recenzie care respectă regulile platformei. Dacă ai
        întrebări sau ai nevoie de clarificări, te rugăm să ne contactezi.
      </Text>
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

const link = {
  color: "#000000",
  textDecoration: "underline",
};
