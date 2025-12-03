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

/**
 * All logical email event types used across the app.
 * This is the canonical list you should reuse from Payload when enqueueing jobs.
 */
export type EmailEventType =
  // User-facing
  | "user.welcome"
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
    getRecipients: (p: AdminListingPendingPayload) =>
      process.env.ADMIN_EMAILS?.split(",") || ["contact@unevent.com"],
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
    getRecipients: (p: AdminReviewPendingPayload) =>
      process.env.ADMIN_EMAILS?.split(",") || ["contact@unevent.com"],
    getSubject: (p) =>
      `⭐ Recenzie nouă așteaptă aprobare pentru „${p.listing_title}”`,
    getPreheader: () =>
      "O nouă recenzie a fost creată și așteaptă aprobarea ta.",
    getTextFallback: (p) =>
      `O nouă recenzie pentru „${p.listing_title}” a fost creată și așteaptă aprobarea ta.\n\nListare: ${p.listing_title} (${p.listing_type})\nRecenzent: ${p.reviewer_name}\nRating: ${p.rating}/5\nID recenzie: ${p.review_id}`,
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
};
