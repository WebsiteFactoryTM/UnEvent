import { Button, Heading, Section, Text } from "@react-email/components";
import * as React from "react";
import { EmailLayout } from "./Layout.js";

export interface ReviewApprovedEmailProps {
  firstName: string;
  listingTitle: string;
  listingType: string;
  listingUrl?: string;
}

export function ReviewApprovedEmail({
  firstName,
  listingTitle,
  listingType,
  listingUrl,
}: ReviewApprovedEmailProps) {
  return (
    <EmailLayout
      preview={`Recenzia ta pentru „${listingTitle}” a fost acceptată`}
    >
      <Heading style={heading}>Recenzia ta a fost acceptată!</Heading>
      <Text style={paragraph}>Salut, {firstName}!</Text>
      <Text style={paragraph}>
        Recenzia ta pentru <strong>„{listingTitle}”</strong> a fost acceptată și
        este acum vizibilă în platformă.
      </Text>
      <Text style={paragraph}>
        Mulțumim pentru feedback-ul tău! Acesta ajută alți utilizatori să ia
        decizii informate.
      </Text>
      {listingUrl && (
        <Section style={buttonContainer}>
          <Button style={button} href={listingUrl}>
            Vezi recenzia
          </Button>
        </Section>
      )}
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
