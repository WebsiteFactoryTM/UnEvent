import {
  FaInstagram,
  FaFacebook,
  FaTiktok,
  FaWhatsapp,
  FaYoutube,
  FaLinkedin,
  FaPhone,
  FaEnvelope,
  FaLocationDot,
  FaWrench,
  FaCalendarDays,
  FaCircleInfo,
  FaMessage,
  FaCrown,
  FaFileLines,
  FaShield,
  FaCookie,
} from "react-icons/fa6";
import type { IconType } from "react-icons";

export interface SocialLink {
  name: string;
  href?: string;
  icon: IconType;
  ariaLabel: string;
}

export interface FooterLink {
  label: string;
  href?: string;
  icon: IconType;
}

export const socialLinks: SocialLink[] = [
  {
    name: "Instagram",
    href: "https://www.instagram.com/unevent.ro?igsh=MXdrNG41YjJwdGhrbw==",
    icon: FaInstagram,
    ariaLabel: "Urmărește-ne pe Instagram",
  },
  {
    name: "Facebook",
    href: "https://www.facebook.com/profile.php?id=61566427264034",
    icon: FaFacebook,
    ariaLabel: "Urmărește-ne pe Facebook",
  },
  {
    name: "TikTok",
    href: "https://www.tiktok.com/@unevent.ro?_t=ZN-90Nf5dGLKMw&_r=1",
    icon: FaTiktok,
    ariaLabel: "Urmărește-ne pe TikTok",
  },
  {
    name: "Whatsapp",
    href: "https://wa.link/7qtfjy",
    icon: FaWhatsapp,
    ariaLabel: "Urmărește-ne pe X (Twitter)",
  },
  {
    name: "YouTube",
    icon: FaYoutube,
    ariaLabel: "Urmărește-ne pe YouTube",
  },
  {
    name: "LinkedIn",
    href: "https://www.linkedin.com/company/un-event",
    icon: FaLinkedin,
    ariaLabel: "Urmărește-ne pe LinkedIn",
  },
];

export const contactLinks: FooterLink[] = [
  {
    label: "Telefon",
    href: "tel:+40739653700",
    icon: FaPhone,
  },
  {
    label: "Email",
    href: "mailto:contact@unevent.ro",
    icon: FaEnvelope,
  },
  {
    label: "Timișoara, România",

    icon: FaLocationDot,
  },
];

export const utileLinks: FooterLink[] = [
  {
    label: "Locații",
    href: "/locatii",
    icon: FaLocationDot,
  },
  {
    label: "Servicii",
    href: "/servicii",
    icon: FaWrench,
  },
  {
    label: "Evenimente",
    href: "/evenimente",
    icon: FaCalendarDays,
  },
  {
    label: "Despre",
    href: "/despre",
    icon: FaCircleInfo,
  },
  {
    label: "Contact",
    href: "/contact",
    icon: FaMessage,
  },
  {
    label: "Promovare (în curând)",

    icon: FaCrown,
  },
];

export const termeniLinks: FooterLink[] = [
  {
    label: "Termeni și condiții",
    href: "/termeni-si-conditii",
    icon: FaFileLines,
  },
  {
    label: "Politica de confidențialitate",
    href: "/politica-de-confidentialitate",
    icon: FaShield,
  },
  {
    label: "Politica cookie",
    href: "/politica-cookie",
    icon: FaCookie,
  },
];
