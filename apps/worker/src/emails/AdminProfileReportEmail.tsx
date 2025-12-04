import { Button, Heading, Section, Text } from "@react-email/components";
import * as React from "react";
import { EmailLayout } from "./Layout.js";

export interface AdminProfileReportEmailProps {
  profileTitle: string;
  profileId: string;
  profileUrl: string;
  reportingUserName: string;
  reportingUserEmail: string;
  reportingUserId: string;
  reportReason: string;
  reportDetails?: string;
  dashboardUrl?: string;
}

export function AdminProfileReportEmail({
  profileTitle,
  profileId,
  profileUrl,
  reportingUserName,
  reportingUserEmail,
  reportingUserId,
  reportReason,
  reportDetails,
  dashboardUrl,
}: AdminProfileReportEmailProps) {
  return (
    <EmailLayout preview={`Raport nou pentru profilul „${profileTitle}”`}>
      <Heading style={heading}>Raport nou pentru profil</Heading>
      <Text style={paragraph}>Un profil a fost raportat.</Text>
      <Section style={infoBox}>
        <Text style={infoLabel}>Profil:</Text>
        <Text style={infoValue}>{profileTitle}</Text>
        <Text style={infoLabel}>ID:</Text>
        <Text style={infoValue}>{profileId}</Text>
        <Text style={infoLabel}>URL:</Text>
        <Text style={infoValue}>
          <a href={profileUrl} style={link}>
            {profileUrl}
          </a>
        </Text>
      </Section>
      <Section style={infoBox}>
        <Text style={infoLabel}>Raportat de:</Text>
        <Text style={infoValue}>{reportingUserName}</Text>
        <Text style={infoLabel}>Email:</Text>
        <Text style={infoValue}>{reportingUserEmail}</Text>
        <Text style={infoLabel}>ID utilizator:</Text>
        <Text style={infoValue}>{reportingUserId}</Text>
        <Text style={infoLabel}>Motiv:</Text>
        <Text style={infoValue}>{reportReason}</Text>
        {reportDetails && (
          <>
            <Text style={infoLabel}>Detalii:</Text>
            <Text style={infoValue}>{reportDetails}</Text>
          </>
        )}
      </Section>
      {profileUrl && (
        <Section style={buttonContainer}>
          <Button style={button} href={profileUrl}>
            Vezi profilul
          </Button>
        </Section>
      )}
      {dashboardUrl && (
        <Section style={buttonContainer}>
          <Button style={buttonSecondary} href={dashboardUrl}>
            Deschide în dashboard
          </Button>
        </Section>
      )}
      <Text style={paragraphSmall}>
        Te rugăm să revizuiesti raportul cât mai curând posibil.
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
  wordBreak: "break-word" as const,
};

const link = {
  color: "#000000",
  textDecoration: "underline",
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

const buttonSecondary = {
  backgroundColor: "#ffffff",
  borderRadius: "4px",
  color: "#000000",
  fontSize: "16px",
  fontWeight: 600,
  textDecoration: "none",
  textAlign: "center" as const,
  display: "inline-block",
  padding: "12px 24px",
  border: "2px solid #000000",
};

const paragraphSmall = {
  color: "#666666",
  fontSize: "14px",
  lineHeight: "20px",
  margin: "20px 0 0",
};
