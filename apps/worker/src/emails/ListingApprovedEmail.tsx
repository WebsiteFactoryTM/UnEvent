import { Button, Heading, Section, Text } from "@react-email/components";
import * as React from "react";
import { EmailLayout } from "./Layout.js";

export interface ListingApprovedEmailProps {
  firstName: string;
  listingTitle: string;
  listingType: string;
  listingId: string;
  listingUrl?: string;
}

export function ListingApprovedEmail({
  firstName,
  listingTitle,
  listingType,
  listingId,
  listingUrl,
}: ListingApprovedEmailProps) {
  const listingTypeLabel =
    listingType === "events"
      ? "evenimentul"
      : listingType === "locations"
        ? "locația"
        : "serviciul";

  return (
    <EmailLayout preview={`Listarea ta „${listingTitle}” a fost acceptată`}>
      <Heading style={heading}>Listarea ta a fost acceptată!</Heading>
      <Text style={paragraph}>Salut, {firstName}!</Text>
      <Text style={paragraph}>
        Listarea ta <strong>„{listingTitle}”</strong> a fost acceptată și este
        acum activă în platformă.
      </Text>
      <Text style={paragraph}>
        Utilizatorii pot acum vedea și interacționa cu {listingTypeLabel} tău.
      </Text>
      {listingUrl && (
        <Section style={buttonContainer}>
          <Button style={button} href={listingUrl}>
            Vezi listarea
          </Button>
        </Section>
      )}
      <Text style={paragraph}>
        Mulțumim că folosești UN:EVENT pentru a-ți promova {listingTypeLabel}!
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
