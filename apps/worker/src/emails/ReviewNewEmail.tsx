import { Button, Heading, Section, Text } from "@react-email/components";
import * as React from "react";
import { EmailLayout } from "./Layout.js";

export interface ReviewNewEmailProps {
  firstName: string;
  listingTitle: string;
  listingType: string;
  reviewerName: string;
  rating: number;
  commentSnippet?: string;
  listingUrl?: string;
}

export function ReviewNewEmail({
  firstName,
  listingTitle,
  listingType,
  reviewerName,
  rating,
  commentSnippet,
  listingUrl,
}: ReviewNewEmailProps) {
  const listingTypeLabel =
    listingType === "events"
      ? "eveniment"
      : listingType === "locations"
        ? "locație"
        : "serviciu";

  const stars = "⭐".repeat(rating);

  return (
    <EmailLayout preview={`Ai o nouă recenzie pentru „${listingTitle}”`}>
      <Heading style={heading}>Ai o nouă recenzie!</Heading>
      <Text style={paragraph}>Salut, {firstName}!</Text>
      <Text style={paragraph}>
        <strong>{reviewerName}</strong> a lăsat o recenzie pentru{" "}
        <strong>„{listingTitle}”</strong>.
      </Text>
      <Section style={reviewBox}>
        <Text style={reviewRating}>
          {stars} ({rating}/5)
        </Text>
        {commentSnippet && (
          <Text style={reviewComment}>"{commentSnippet}"</Text>
        )}
      </Section>
      {listingUrl && (
        <Section style={buttonContainer}>
          <Button style={button} href={listingUrl}>
            Vezi recenzia completă
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

const reviewBox = {
  backgroundColor: "#f5f5f5",
  borderLeft: "3px solid #000000",
  padding: "16px",
  margin: "20px 0",
};

const reviewRating = {
  color: "#000000",
  fontSize: "18px",
  fontWeight: 600,
  lineHeight: "24px",
  margin: "0 0 12px",
};

const reviewComment = {
  color: "#000000",
  fontSize: "16px",
  lineHeight: "24px",
  margin: "0",
  fontStyle: "italic" as const,
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
