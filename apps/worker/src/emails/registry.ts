import type { ReactElement } from "react";
import {
  EventReminderEmail,
  type EventReminderEmailProps,
} from "./EventReminderEmail.js";
import {
  AdminDailyDigestEmail,
  type AdminDailyDigestEmailProps,
} from "./AdminDailyDigestEmail.js";
import {
  UserWelcomeEmail,
  type UserWelcomeEmailProps,
} from "./UserWelcomeEmail.js";
import {
  ListingApprovedEmail,
  type ListingApprovedEmailProps,
} from "./ListingApprovedEmail.js";
import {
  ListingRejectedEmail,
  type ListingRejectedEmailProps,
} from "./ListingRejectedEmail.js";
import { ReviewNewEmail, type ReviewNewEmailProps } from "./ReviewNewEmail.js";
import {
  ReviewApprovedEmail,
  type ReviewApprovedEmailProps,
} from "./ReviewApprovedEmail.js";
import {
  ReviewRejectedEmail,
  type ReviewRejectedEmailProps,
} from "./ReviewRejectedEmail.js";
import {
  AdminListingPendingEmail,
  type AdminListingPendingEmailProps,
} from "./AdminListingPendingEmail.js";
import {
  AdminReviewPendingEmail,
  type AdminReviewPendingEmailProps,
} from "./AdminReviewPendingEmail.js";
import {
  AdminUserNewEmail,
  type AdminUserNewEmailProps,
} from "./AdminUserNewEmail.js";
import {
  UserWelcomeClientEmail,
  type UserWelcomeClientEmailProps,
} from "./UserWelcomeClientEmail.js";
import {
  UserWelcomeHostEmail,
  type UserWelcomeHostEmailProps,
} from "./UserWelcomeHostEmail.js";
import {
  UserWelcomeOrganizerEmail,
  type UserWelcomeOrganizerEmailProps,
} from "./UserWelcomeOrganizerEmail.js";
import {
  UserWelcomeProviderEmail,
  type UserWelcomeProviderEmailProps,
} from "./UserWelcomeProviderEmail.js";

/**
 * All logical email event types used across the app.
 * This is the canonical list you should reuse from Payload when enqueueing jobs.
 */
export type EmailEventType =
  // User-facing
  | "user.welcome"
  | "user.welcome.client"
  | "user.welcome.host"
  | "user.welcome.organizer"
  | "user.welcome.provider"
  | "user.reset.start"
  | "user.reset.confirmed"
  // | "message.new"
  | "listing.approved"
  | "listing.rejected"
  | "listing.finished"
  | "listing.recommended"
  | "listing.search-stats"
  | "listing.view-stats"
  | "account.verified"
  | "account.verification-rejected"
  | "account.deleted"
  | "listing.favorited"
  | "review.new"
  | "review.approved"
  | "review.rejected"
  | "event.reminder.24h"
  | "event.participation.reminder"
  | "event.participation.confirmed"
  // Admin
  | "admin.listing.pending"
  | "admin.review.pending"
  | "admin.user.new"
  | "admin.report.new"
  | "admin.password.changed"
  | "admin.verification.request"
  | "admin.digest.daily";

export interface EmailTemplateConfig<Payload = unknown> {
  type: EmailEventType;
  getRecipients: (payload: Payload) => string | string[];
  getSubject: (payload: Payload) => string;
  getPreheader?: (payload: Payload) => string;
  getTextFallback?: (payload: Payload) => string | undefined;
  render: (payload: Payload) => ReactElement;
  tags?: Record<string, string>;
}

// Payload shapes expected by current worker jobs

export interface EventReminderPayload {
  first_name?: string;
  userEmail: string;
  event_title: string;
  city?: string;
  start_date: string; // ISO date (YYYY-MM-DD)
  start_time: string; // HH:mm
  eventId: string;
  eventUrl?: string;
}

export interface AdminDigestPayload {
  adminEmails?: string | string[];
  date?: string; // human readable date, optional
  stats?: AdminDailyDigestEmailProps["stats"];
}

export interface UserWelcomePayload {
  first_name?: string;
  email: string;
  confirm_url: string;
  support_email?: string;
}

/**
 * Payload for post-verification welcome emails
 *
 * Logic:
 * - Every user is a "client" by default
 * - If user has ONLY "client" role → send user.welcome.client
 * - If user has any other role besides client → send welcome email(s) for those roles ONLY
 * - Multiple roles = multiple welcome emails (e.g., both host and organizer)
 *
 * Examples:
 * - User roles: ["client"] → send user.welcome.client
 * - User roles: ["client", "host"] → send user.welcome.host (NOT client)
 * - User roles: ["client", "host", "organizer"] → send user.welcome.host AND user.welcome.organizer (NOT client)
 */
export interface UserWelcomeVerifiedPayload {
  first_name?: string;
  email: string;
  user_type: "client" | "host" | "organizer" | "provider";
  dashboard_url?: string;
  support_email?: string;
}

export interface ListingApprovedPayload {
  first_name?: string;
  userEmail: string;
  listing_title: string;
  listing_type: string;
  listing_id: string;
  listing_url?: string;
}

export interface ListingRejectedPayload {
  first_name?: string;
  userEmail: string;
  listing_title: string;
  listing_type: string;
  listing_id: string;
  reason?: string;
  support_email?: string;
}

export interface ReviewNewPayload {
  first_name?: string;
  userEmail: string;
  listing_title: string;
  listing_type: string;
  reviewer_name: string;
  rating: number;
  comment_snippet?: string;
  listing_url?: string;
}

export interface ReviewApprovedPayload {
  first_name?: string;
  userEmail: string;
  listing_title: string;
  listing_type: string;
  listing_url?: string;
}

export interface ReviewRejectedPayload {
  first_name?: string;
  userEmail: string;
  listing_title: string;
  listing_type: string;
  reason?: string;
  support_email?: string;
}

export interface AdminListingPendingPayload {
  listing_title: string;
  listing_type: string;
  listing_id: string;
  created_by: string;
  dashboard_url?: string;
}

export interface AdminReviewPendingPayload {
  listing_title: string;
  listing_type: string;
  reviewer_name: string;
  rating: number;
  review_id: string;
  dashboard_url?: string;
}

export interface AdminUserNewPayload {
  user_email: string;
  display_name?: string;
  user_id: string;
  roles: string[];
  dashboard_url?: string;
}

/**
 * Registry of email templates that the worker can send.
 * Only event types present here are actually wired to real templates.
 */
export const EMAIL_TEMPLATES: Partial<
  Record<EmailEventType, EmailTemplateConfig<any>>
> = {
  "listing.approved": {
    type: "listing.approved",
    getRecipients: (p: ListingApprovedPayload) => p.userEmail,
    getSubject: (p) => `✅ Listarea ta „${p.listing_title}” a fost acceptată`,
    getPreheader: () => "Listarea ta este acum activă în platformă.",
    getTextFallback: (p) =>
      `Salut${p.first_name ? `, ${p.first_name}` : ""}!\n\nListarea ta „${p.listing_title}” a fost acceptată și este acum activă în platformă.`,
    render: (p) =>
      ListingApprovedEmail({
        firstName: p.first_name ?? "",
        listingTitle: p.listing_title,
        listingType: p.listing_type,
        listingId: p.listing_id,
        listingUrl: p.listing_url,
      } satisfies ListingApprovedEmailProps),
    tags: { category: "user", template: "listing.approved" },
  },

  "listing.rejected": {
    type: "listing.rejected",
    getRecipients: (p: ListingRejectedPayload) => p.userEmail,
    getSubject: (p) => `❌ Listarea ta „${p.listing_title}” a fost respinsă`,
    getPreheader: () =>
      "Listarea ta a fost respinsă. Vezi motivul și poți să o editezi.",
    getTextFallback: (p) =>
      `Salut${p.first_name ? `, ${p.first_name}` : ""}!\n\nNe pare rău să te anunțăm că listarea ta „${p.listing_title}” a fost respinsă.${p.reason ? `\n\nMotiv: ${p.reason}` : ""}`,
    render: (p) =>
      ListingRejectedEmail({
        firstName: p.first_name ?? "",
        listingTitle: p.listing_title,
        listingType: p.listing_type,
        listingId: p.listing_id,
        listingUrl: p.listing_url,
        reason: p.reason,
        supportEmail: p.support_email,
      } satisfies ListingRejectedEmailProps),
    tags: { category: "user", template: "listing.rejected" },
  },

  "review.new": {
    type: "review.new",
    getRecipients: (p: ReviewNewPayload) => p.userEmail,
    getSubject: (p) => `⭐ Ai o nouă recenzie pentru „${p.listing_title}”`,
    getPreheader: (p) =>
      `${p.reviewer_name} a lăsat o recenzie cu ${p.rating} stele.`,
    getTextFallback: (p) =>
      `Salut${p.first_name ? `, ${p.first_name}` : ""}!\n\n${p.reviewer_name} a lăsat o recenzie pentru „${p.listing_title}”: ${p.rating}/5 stele.${p.comment_snippet ? `\n\nComentariu: "${p.comment_snippet}"` : ""}`,
    render: (p) =>
      ReviewNewEmail({
        firstName: p.first_name ?? "",
        listingTitle: p.listing_title,
        listingType: p.listing_type,
        reviewerName: p.reviewer_name,
        rating: p.rating,
        commentSnippet: p.comment_snippet,
        listingUrl: p.listing_url,
      } satisfies ReviewNewEmailProps),
    tags: { category: "user", template: "review.new" },
  },

  "review.approved": {
    type: "review.approved",
    getRecipients: (p: ReviewApprovedPayload) => p.userEmail,
    getSubject: (p) =>
      `✅ Recenzia ta pentru „${p.listing_title}” a fost acceptată`,
    getPreheader: () => "Recenzia ta este acum vizibilă în platformă.",
    getTextFallback: (p) =>
      `Salut${p.first_name ? `, ${p.first_name}` : ""}!\n\nRecenzia ta pentru „${p.listing_title}” a fost acceptată și este acum vizibilă în platformă.`,
    render: (p) =>
      ReviewApprovedEmail({
        firstName: p.first_name ?? "",
        listingTitle: p.listing_title,
        listingType: p.listing_type,
        listingUrl: p.listing_url,
      } satisfies ReviewApprovedEmailProps),
    tags: { category: "user", template: "review.approved" },
  },

  "review.rejected": {
    type: "review.rejected",
    getRecipients: (p: ReviewRejectedPayload) => p.userEmail,
    getSubject: (p) =>
      `❌ Recenzia ta pentru „${p.listing_title}” a fost respinsă`,
    getPreheader: () => "Recenzia ta a fost respinsă. Vezi motivul.",
    getTextFallback: (p) =>
      `Salut${p.first_name ? `, ${p.first_name}` : ""}!\n\nNe pare rău să te anunțăm că recenzia ta pentru „${p.listing_title}” a fost respinsă.${p.reason ? `\n\nMotiv: ${p.reason}` : ""}`,
    render: (p) =>
      ReviewRejectedEmail({
        firstName: p.first_name ?? "",
        listingTitle: p.listing_title,
        listingType: p.listing_type,
        reason: p.reason,
        supportEmail: p.support_email,
      } satisfies ReviewRejectedEmailProps),
    tags: { category: "user", template: "review.rejected" },
  },

  "admin.listing.pending": {
    type: "admin.listing.pending",
    getRecipients: (p: AdminListingPendingPayload) => {
      const adminEmails = process.env.ADMIN_EMAILS;

      if (adminEmails) {
        // Split by comma and trim whitespace
        let emails = adminEmails
          .split(",")
          .map((e) => e.trim())
          .filter(Boolean)
          .filter((e) => e.length > 0);

        // Validate each email format
        const validEmails: string[] = [];
        for (let i = 0; i < emails.length; i++) {
          const email = emails[i];

          if (!email || typeof email !== "string") {
            console.error(
              `[EmailRegistry] Invalid email type at index ${i}:`,
              email,
            );
            continue;
          }

          if (!email.includes("@")) {
            console.error(
              `[EmailRegistry] Email missing @ at index ${i}:`,
              email,
            );
            continue;
          }

          // Basic email format check
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!emailRegex.test(email)) {
            console.error(
              `[EmailRegistry] Invalid email format at index ${i}:`,
              email,
            );
            continue;
          }

          validEmails.push(email);
        }

        emails = validEmails;

        // Validate we have at least one email
        if (emails.length === 0) {
          console.warn(
            `[EmailRegistry] ADMIN_EMAILS parsed to empty array after validation, using default`,
          );
          return ["contact@unevent.ro"];
        }

        return emails;
      }
      return ["contact@unevent.ro"];
    },
    getSubject: (p) =>
      `📋 Listare nouă așteaptă aprobare: „${p.listing_title}”`,
    getPreheader: () =>
      "O nouă listare a fost creată și așteaptă aprobarea ta.",
    getTextFallback: (p) =>
      `O nouă listare de tip ${p.listing_type} a fost creată și așteaptă aprobarea ta.\n\nTitlu: ${p.listing_title}\nTip: ${p.listing_type}\nCreat de: ${p.created_by}\nID: ${p.listing_id}`,
    render: (p) =>
      AdminListingPendingEmail({
        listingTitle: p.listing_title,
        listingType: p.listing_type,
        listingId: p.listing_id,
        createdBy: p.created_by,
        dashboardUrl: p.dashboard_url,
      } satisfies AdminListingPendingEmailProps),
    tags: { category: "admin", template: "admin.listing.pending" },
  },

  "admin.review.pending": {
    type: "admin.review.pending",
    getRecipients: (p: AdminReviewPendingPayload) => {
      const adminEmails = process.env.ADMIN_EMAILS;
      console.log(
        `[EmailRegistry] admin.review.pending - ADMIN_EMAILS env var:`,
        {
          raw: adminEmails,
          type: typeof adminEmails,
          length: adminEmails?.length,
        },
      );

      if (adminEmails) {
        // Split by comma and trim whitespace
        let emails = adminEmails
          .split(",")
          .map((e) => e.trim())
          .filter(Boolean)
          .filter((e) => e.length > 0);

        // Validate each email format
        const validEmails: string[] = [];
        for (const email of emails) {
          if (
            typeof email === "string" &&
            email.includes("@") &&
            /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
          ) {
            validEmails.push(email);
          } else {
            console.error(
              `[EmailRegistry] Invalid email format in admin.review.pending:`,
              email,
            );
          }
        }

        emails = validEmails;

        if (emails.length === 0) {
          console.warn(
            `[EmailRegistry] ADMIN_EMAILS parsed to empty array, using default`,
          );
          return ["contact@unevent.ro"];
        }

        return emails;
      }
      return ["contact@unevent.ro"];
    },
    getSubject: (p) =>
      `⭐ Recenzie nouă așteaptă aprobare pentru „${p.listing_title}"`,
    getPreheader: () =>
      "O nouă recenzie a fost creată și așteaptă aprobarea ta.",
    getTextFallback: (p) =>
      `O nouă recenzie pentru „${p.listing_title}" a fost creată și așteaptă aprobarea ta.\n\nListare: ${p.listing_title} (${p.listing_type})\nRecenzent: ${p.reviewer_name}\nRating: ${p.rating}/5\nID recenzie: ${p.review_id}`,
    render: (p) =>
      AdminReviewPendingEmail({
        listingTitle: p.listing_title,
        listingType: p.listing_type,
        reviewerName: p.reviewer_name,
        rating: p.rating,
        reviewId: p.review_id,
        dashboardUrl: p.dashboard_url,
      } satisfies AdminReviewPendingEmailProps),
    tags: { category: "admin", template: "admin.review.pending" },
  },

  // Post-verification welcome emails (sent ONLY if user has no other roles besides "client")
  "user.welcome.client": {
    type: "user.welcome.client",
    getRecipients: (p: UserWelcomeVerifiedPayload) => p.email,
    getSubject: () => `🎉 Bun venit pe Unevent!`,
    getPreheader: () =>
      "Ești gata să descoperi cele mai tari evenimente din orașul tău.",
    getTextFallback: (p) =>
      `Salut${p.first_name ? `, ${p.first_name}` : ""}!\n\nBine ai venit pe Unevent! Ești gata să descoperi evenimente, locații și servicii din orașul tău.`,
    render: (p) =>
      UserWelcomeClientEmail({
        firstName: p.first_name ?? "",
        dashboardUrl: p.dashboard_url,
        supportEmail: p.support_email,
      } satisfies UserWelcomeClientEmailProps),
    tags: { category: "user", template: "user.welcome.client" },
  },

  "user.welcome.host": {
    type: "user.welcome.host",
    getRecipients: (p: UserWelcomeVerifiedPayload) => p.email,
    getSubject: () => `✅ Ești Gazdă pe UN:EVENT`,
    getPreheader: () => "Publică prima ta locație în 2 minute.",
    getTextFallback: (p) =>
      `Salut${p.first_name ? `, ${p.first_name}` : ""}! Ți-am activat rolul Gazdă.\n\n4 pași rapizi ca să atragi rezervări:\n• Încarcă 8–10 poze luminoase\n• Adaugă titlu locație, descriere, capacitate, dotări\n• Marchează precis adresa pe hartă\n• Adaugă date de contact\n\nListează-ți acum locația și primește cereri.`,
    render: (p) =>
      UserWelcomeHostEmail({
        firstName: p.first_name ?? "",
        dashboardUrl: p.dashboard_url,
        supportEmail: p.support_email,
      } satisfies UserWelcomeHostEmailProps),
    tags: { category: "user", template: "user.welcome.host" },
  },

  "user.welcome.organizer": {
    type: "user.welcome.organizer",
    getRecipients: (p: UserWelcomeVerifiedPayload) => p.email,
    getSubject: () => `✅ Ești Organizator pe UN:EVENT`,
    getPreheader: () => "Publică primul tău eveniment.",
    getTextFallback: (p) =>
      `Salut${p.first_name ? `, ${p.first_name}` : ""}! Rolul Organizator este activ.\n\nAdaugă un eveniment cu dată, locație, descriere și media.\n\nCum să-ți crești vizibilitatea:\n• Adaugă titlu și descriere cât mai precise și locația exactă\n• Adaugă + 4–6 imagini relevante\n• Setează link spre achiziționare bilete ori opțiune "Intrare liberă"\n• Adaugă date de contact`,
    render: (p) =>
      UserWelcomeOrganizerEmail({
        firstName: p.first_name ?? "",
        dashboardUrl: p.dashboard_url,
        supportEmail: p.support_email,
      } satisfies UserWelcomeOrganizerEmailProps),
    tags: { category: "user", template: "user.welcome.organizer" },
  },

  "user.welcome.provider": {
    type: "user.welcome.provider",
    getRecipients: (p: UserWelcomeVerifiedPayload) => p.email,
    getSubject: () => `✅ Ești Prestator Servicii pe UN:EVENT`,
    getPreheader: () => "Creează primul pachet și apari în căutări.",
    getTextFallback: (p) =>
      `Salut${p.first_name ? `, ${p.first_name}` : ""}! Ești Prestator servicii pe UN:EVENT.\n\n4 idei ca să ieși în față:\n• Adaugă titlu și descriere cât mai precise\n• Încarcă 6–10 foto servicii sau portofoliu\n• Selectează orașul\n• Adaugă date de contact`,
    render: (p) =>
      UserWelcomeProviderEmail({
        firstName: p.first_name ?? "",
        dashboardUrl: p.dashboard_url,
        supportEmail: p.support_email,
      } satisfies UserWelcomeProviderEmailProps),
    tags: { category: "user", template: "user.welcome.provider" },
  },

  "admin.user.new": {
    type: "admin.user.new",
    getRecipients: (p: AdminUserNewPayload) => {
      const adminEmails = process.env.ADMIN_EMAILS;

      if (adminEmails) {
        // Split by comma and trim whitespace
        let emails = adminEmails
          .split(",")
          .map((e) => e.trim())
          .filter(Boolean)
          .filter((e) => e.length > 0);

        // Validate each email format
        const validEmails: string[] = [];
        for (const email of emails) {
          if (
            typeof email === "string" &&
            email.includes("@") &&
            /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
          ) {
            validEmails.push(email);
          } else {
            console.error(
              `[EmailRegistry] Invalid email format in admin.user.new:`,
              email,
            );
          }
        }

        emails = validEmails;

        if (emails.length === 0) {
          console.warn(
            `[EmailRegistry] ADMIN_EMAILS parsed to empty array, using default`,
          );
          return ["contact@unevent.ro"];
        }

        return emails;
      }
      return ["contact@unevent.ro"];
    },
    getSubject: (p) => `👤 Utilizator nou înregistrat: ${p.user_email}`,
    getPreheader: () => "Un nou utilizator s-a înregistrat pe platformă.",
    getTextFallback: (p) =>
      `Un nou utilizator s-a înregistrat pe platformă.\n\nEmail: ${p.user_email}\nNume: ${p.display_name || "N/A"}\nRoluri: ${p.roles.join(", ")}\nID: ${p.user_id}`,
    render: (p) =>
      AdminUserNewEmail({
        userEmail: p.user_email,
        displayName: p.display_name,
        userId: p.user_id,
        roles: p.roles,
        dashboardUrl: p.dashboard_url,
      } satisfies AdminUserNewEmailProps),
    tags: { category: "admin", template: "admin.user.new" },
  },
};
