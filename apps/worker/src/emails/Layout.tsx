import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Section,
  Text,
} from "@react-email/components";
import * as React from "react";

interface LayoutProps {
  preview?: string;
  children: React.ReactNode;
}

export function EmailLayout({ preview, children }: LayoutProps) {
  return (
    <Html>
      <Head />
      <Preview>{preview || "UnEvent"}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={header}>
            <Heading style={heading}>UnEvent</Heading>
          </Section>
          <Section style={content}>{children}</Section>
          <Section style={footer}>
            <Text style={footerText}>
              © {new Date().getFullYear()} UnEvent. All rights reserved.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

const main = {
  backgroundColor: "#ffffff",
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
};

const container = {
  backgroundColor: "#ffffff",
  margin: "0 auto",
  padding: "20px 0 48px",
  maxWidth: "600px",
};

const header = {
  borderBottom: "1px solid #000000",
  paddingBottom: "20px",
  marginBottom: "30px",
};

const heading = {
  color: "#000000",
  fontSize: "24px",
  fontWeight: "600",
  margin: "0",
  textAlign: "left" as const,
};

const content = {
  padding: "0 20px",
};

const footer = {
  borderTop: "1px solid #e5e5e5",
  marginTop: "40px",
  paddingTop: "20px",
};

const footerText = {
  color: "#666666",
  fontSize: "12px",
  lineHeight: "16px",
  margin: "0",
  textAlign: "center" as const,
};
