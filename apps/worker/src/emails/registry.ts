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

/**
 * All logical email event types used across the app.
 * This is the canonical list you should reuse from Payload when enqueueing jobs.
 */
export type EmailEventType =
  // User-facing
  | "user.welcome"
  | "user.reset.start"
  | "user.reset.confirmed"
  | "message.new"
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
 * Registry of email templates that the worker can send.
 * Only event types present here are actually wired to real templates.
 */
export const EMAIL_TEMPLATES: Partial<
  Record<EmailEventType, EmailTemplateConfig<any>>
> = {
  "user.welcome": {
    type: "user.welcome",
    getRecipients: (p: UserWelcomePayload) => p.email,
    getSubject: () => "Bine ai venit la UN:EVENT — confirmă-ți emailul",
    getPreheader: () => "Activează-ți contul în câteva secunde.",
    getTextFallback: (p) =>
      `Salut, ${p.first_name ?? "acolo"}!\n\nTe-ai înregistrat cu succes la UN:EVENT. Confirmă adresa de email pentru a-ți activa contul:\n${p.confirm_url}\n\nDacă nu ai creat tu contul, ignoră acest email.`,
    render: (p) =>
      UserWelcomeEmail({
        firstName: p.first_name ?? "",
        confirmUrl: p.confirm_url,
        supportEmail: p.support_email,
      } satisfies UserWelcomeEmailProps),
    tags: { category: "user", template: "user.welcome" },
  },

  "event.reminder.24h": {
    type: "event.reminder.24h",
    getRecipients: (p: EventReminderPayload) => p.userEmail,
    getSubject: (p) => `🔔 Reminder: participi la „${p.event_title}” mâine`,
    getPreheader: (p) =>
      `Ne vedem la ${p.start_time} în ${p.city ?? ""} — verifică detaliile evenimentului.`,
    getTextFallback: (p) =>
      `Reminder: ${p.event_title} are loc mâine, ${new Date(
        `${p.start_date}T${p.start_time}`,
      ).toLocaleString("ro-RO")}.`,
    render: (p) =>
      EventReminderEmail({
        eventTitle: p.event_title,
        eventDate: `${p.start_date}T${p.start_time}`,
        eventId: p.eventId,
        eventUrl: p.eventUrl,
      } satisfies EventReminderEmailProps),
    tags: { category: "user", template: "event.reminder.24h" },
  },

  "admin.digest.daily": {
    type: "admin.digest.daily",
    getRecipients: (p: AdminDigestPayload) =>
      p.adminEmails ||
      process.env.ADMIN_EMAILS?.split(",") || ["admin@unevent.com"],
    getSubject: (p) =>
      `Daily Admin Digest - ${
        p.date ??
        new Date().toLocaleDateString("ro-RO", {
          year: "numeric",
          month: "long",
          day: "numeric",
        })
      }`,
    getPreheader: () =>
      "Rezumat zilnic: evenimente, recenzii, utilizatori, moderări.",
    getTextFallback: (p) => {
      const stats = p.stats ?? {
        newEvents: 0,
        newReviews: 0,
        newUsers: 0,
        pendingModerations: 0,
      };
      const displayDate =
        p.date ??
        new Date().toLocaleDateString("ro-RO", {
          year: "numeric",
          month: "long",
          day: "numeric",
        });
      return `Daily Admin Digest for ${displayDate}\n\nNew Events: ${
        stats.newEvents ?? 0
      }\nNew Reviews: ${stats.newReviews ?? 0}\nNew Users: ${
        stats.newUsers ?? 0
      }\nPending Moderations: ${stats.pendingModerations ?? 0}`;
    },
    render: (p) => {
      const displayDate =
        p.date ??
        new Date().toLocaleDateString("ro-RO", {
          year: "numeric",
          month: "long",
          day: "numeric",
        });
      return AdminDailyDigestEmail({
        date: displayDate,
        stats: p.stats,
      } satisfies AdminDailyDigestEmailProps);
    },
    tags: { category: "admin", template: "admin.digest.daily" },
  },
};
