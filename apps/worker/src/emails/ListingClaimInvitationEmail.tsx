import { Button, Heading, Section, Text } from "@react-email/components";
import * as React from "react";
import { EmailLayout } from "./Layout.js";

export interface ListingClaimInvitationEmailProps {
  listingTitle: string;
  listingType: string;
  listingId: string;
  listingSlug?: string;
  contactEmail: string;
  claimUrl: string;
}

export function ListingClaimInvitationEmail({
  listingTitle,
  listingType,
  listingId,
  listingSlug,
  contactEmail,
  claimUrl,
}: ListingClaimInvitationEmailProps) {
  const listingTypeLabel =
    listingType === "events"
      ? "evenimentul"
      : listingType === "locations"
        ? "locația"
        : "serviciul";

  return (
    <EmailLayout preview={`Am listat ${listingTitle} pe UN:EVENT`}>
      <Heading style={heading}>🚀 Am listat {listingTitle} pe UN:EVENT</Heading>

      <Text style={paragraph}>Salutare,</Text>

      <Text style={paragraph}>
        Îți scriu pentru că echipa noastră a selectat{" "}
        <strong>„{listingTitle}”</strong> drept una dintre{" "}
        {listingTypeLabel === "locația"
          ? "locațiile"
          : listingTypeLabel === "serviciul"
            ? "serviciile"
            : "evenimentele"}{" "}
        de top pe care le recomandăm pe UN:EVENT – noua platformă digitală
        dedicată organizării de evenimente din România.
      </Text>

      <Text style={paragraph}>
        <strong>
          Pe scurt: Nu îți vindem nimic. Ți-am creat deja o prezență gratuită.
        </strong>
      </Text>

      <Text style={paragraph}>
        Pentru că ne dorim ca utilizatorii noștri (mirese, organizatori de
        evenimente, petrecăreți) să găsească cele mai bune opțiuni din piață, am
        luat inițiativa de a crea un profil preliminar pentru voi.
      </Text>

      <Text style={paragraph}>
        În acest moment, profilul vostru folosește o imagine generică și
        informații publice de bază. Știm că realitatea arată mult mai bine decât
        o fotografie stock, iar clienții vor să vadă exact ce oferiți.
      </Text>

      <Section style={highlightBox}>
        <Text style={highlightTitle}>💡 Soluția (Durează 2 minute)</Text>
        <Text style={highlightText}>
          Am creat un buton special prin care poți deveni oficial "proprietarul"
          acestui profil. Îți oferim acces complet pentru a:
        </Text>
        <Text style={highlightList}>
          • Șterge poza generică și a încărca fotografiile voastre reale.
        </Text>
        <Text style={highlightList}>
          • Actualiza descrierea și prețurile (dacă dorești).
        </Text>
        <Text style={highlightList}>
          • Primi cereri de ofertă direct de la clienți.
        </Text>
        <Text style={highlightList}>
          • Șterge listarea dacă nu dorești să fie publică. (Sau ne poți
          contacta oricând pentru a o șterge noi.)
        </Text>
        <Text style={highlightText}>
          Este complet gratuit să îți revendici profilul și să fii listat pe
          UN:EVENT.
        </Text>
      </Section>

      <Section style={buttonContainer}>
        <Button style={button} href={claimUrl}>
          Revendică {listingTypeLabel}
        </Button>
      </Section>

      <Text style={paragraph}>
        <strong>De ce UN:EVENT?</strong> Suntem aici să digitalizăm industria.
        Ne-am propus să simplificăm modul prin care organizatorii își planifică
        întregul eveniment, de la locație la ultimul detaliu logistic. Fii
        alături de noi în această călătorie.
      </Text>

      <Text style={paragraph}>
        Așteptăm să vedem profilul vostru strălucind!
      </Text>

      <Text style={signature}>
        Cu drag,
        <br />
        <strong>Ernest Slach</strong>
        <br />
        Fondator UN:EVENT
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

const highlightBox = {
  backgroundColor: "#f9f9f9",
  border: "2px solid #000000",
  borderRadius: "4px",
  padding: "20px",
  margin: "24px 0",
};

const highlightTitle = {
  color: "#000000",
  fontSize: "18px",
  fontWeight: 600,
  lineHeight: "24px",
  margin: "0 0 12px",
};

const highlightText = {
  color: "#000000",
  fontSize: "16px",
  lineHeight: "24px",
  margin: "0 0 12px",
};

const highlightList = {
  color: "#000000",
  fontSize: "16px",
  lineHeight: "24px",
  margin: "0 0 8px",
  paddingLeft: "8px",
};

const buttonContainer = {
  padding: "24px 0",
  textAlign: "center" as const,
};

const button = {
  backgroundColor: "#000000",
  borderRadius: "4px",
  color: "#ffffff",
  fontSize: "18px",
  fontWeight: 600,
  textDecoration: "none",
  textAlign: "center" as const,
  display: "inline-block",
  padding: "14px 32px",
};

const signature = {
  color: "#000000",
  fontSize: "16px",
  lineHeight: "24px",
  margin: "24px 0 0",
  fontStyle: "italic" as const,
};
