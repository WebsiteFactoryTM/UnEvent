import { Button, Heading, Section, Text } from "@react-email/components";
import * as React from "react";
import { EmailLayout } from "./Layout.js";

export interface ClaimApprovedEmailProps {
  firstName: string;
  listingTitle: string;
  listingType: string;
  listingId: string;
  listingUrl?: string;
  claimId: string;
}

export function ClaimApprovedEmail({
  firstName,
  listingTitle,
  listingType,
  listingId,
  listingUrl,
  claimId,
}: ClaimApprovedEmailProps) {
  const listingTypeLabel =
    listingType === "events"
      ? "evenimentul"
      : listingType === "locations"
        ? "locația"
        : "serviciul";

  return (
    <EmailLayout
      preview={`Cererea ta de revendicare pentru „${listingTitle}” a fost aprobată`}
    >
      <Heading style={heading}>🎉 Cererea ta a fost aprobată!</Heading>
      <Text style={paragraph}>Salut{firstName ? `, ${firstName}` : ""}!</Text>
      <Text style={paragraph}>
        Cererea ta de revendicare pentru <strong>„{listingTitle}”</strong> a
        fost aprobată.
      </Text>
      <Text style={paragraph}>
        Acum ești proprietarul {listingTypeLabel} și poți gestiona listarea din
        contul tău.
      </Text>
      {listingUrl && (
        <Section style={buttonContainer}>
          <Button style={button} href={listingUrl}>
            Vezi listarea
          </Button>
        </Section>
      )}
      <Text style={paragraph}>
        Poți edita, actualiza sau șterge listarea oricând din contul tău.
      </Text>
      <Text style={paragraph}>Mulțumim că folosești UN:EVENT!</Text>
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
