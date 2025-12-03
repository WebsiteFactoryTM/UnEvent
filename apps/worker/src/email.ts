import { Resend } from "resend";
import { render } from "@react-email/render";
import * as Sentry from "@sentry/node";
import type { ReactElement } from "react";
import {
  EMAIL_TEMPLATES,
  type EmailEventType,
  type EmailTemplateConfig,
} from "./emails/registry.js";

let resendClient: Resend | null = null;

/**
 * Get or create Resend client
 */
function getResendClient(): Resend | null {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    return null;
  }

  if (!resendClient) {
    resendClient = new Resend(apiKey);
  }

  return resendClient;
}

/**
 * Determine the actual recipient based on environment
 * In development, uses TEST_EMAIL to avoid Resend domain verification requirements
 */
function getActualRecipient(originalTo: string | string[]): string[] {
  const isProduction = process.env.NODE_ENV === "production";
  const testEmail = process.env.TEST_EMAIL;
  const overrideTo = process.env.RESEND_OVERRIDE_TO;

  // In production, always send to real recipients
  if (isProduction) {
    return Array.isArray(originalTo) ? originalTo : [originalTo];
  }

  // In development, use TEST_EMAIL if set (for Resend testing without domain verification)
  if (testEmail) {
    const originalRecipients = Array.isArray(originalTo)
      ? originalTo.join(", ")
      : originalTo;
    console.log(
      `[Email] Development mode: Overriding recipient(s) ${originalRecipients} -> ${testEmail}`,
    );
    return [testEmail];
  }

  // Fallback to RESEND_OVERRIDE_TO if TEST_EMAIL is not set
  if (overrideTo) {
    const originalRecipients = Array.isArray(originalTo)
      ? originalTo.join(", ")
      : originalTo;
    console.log(
      `[Email] Overriding recipient(s) ${originalRecipients} -> ${overrideTo}`,
    );
    return [overrideTo];
  }

  // No override set - send to real recipients (may fail in dev without domain verification)
  console.warn(
    `[Email] No TEST_EMAIL or RESEND_OVERRIDE_TO set in development. Sending to real recipients (may fail without domain verification): ${Array.isArray(originalTo) ? originalTo.join(", ") : originalTo}`,
  );
  return Array.isArray(originalTo) ? originalTo : [originalTo];
}

export interface TemplatedEmailOptions {
  to: string | string[];
  subject: string;
  react: ReactElement;
  textFallback?: string;
  from?: string;
  replyTo?: string;
}

/**
 * Send a templated email using React Email component
 */
export async function sendTemplatedEmail(
  options: TemplatedEmailOptions,
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  const {
    to,
    subject,
    react,
    textFallback,
    from = process.env.RESEND_FROM_EMAIL || "noreply@unevent.ro",
    replyTo,
  } = options;

  const client = getResendClient();

  // Check if email is enabled
  if (!client) {
    const message = "[Email] RESEND_API_KEY not set, skipping email send";
    console.warn(message);
    console.log("[Email] Would send:", {
      from,
      to: Array.isArray(to) ? to.join(", ") : to,
      subject,
    });
    return { success: false, error: "RESEND_API_KEY not set" };
  }

  try {
    // Render React Email component to HTML
    const html = await render(react);

    // Determine actual recipients based on environment
    const actualTo = getActualRecipient(to);

    // Send via Resend
    const { data, error } = await client.emails.send({
      from,
      to: actualTo,
      subject,
      html,
      text: textFallback || undefined,
      replyTo: replyTo || undefined,
    });

    if (error) {
      console.error("[Email] Resend error:", error);
      Sentry.captureException(
        new Error(`Resend error: ${JSON.stringify(error)}`),
        {
          tags: {
            component: "email",
            emailType: "templated",
          },
          extra: {
            to: actualTo,
            subject,
            error,
          },
        },
      );
      return { success: false, error: JSON.stringify(error) };
    }

    console.log(`[Email] ✅ Sent successfully to ${actualTo.join(", ")}`, {
      messageId: data?.id,
      subject,
    });

    return { success: true, messageId: data?.id };
  } catch (error) {
    console.error("[Email] Error sending email:", error);
    Sentry.captureException(error as Error, {
      tags: {
        component: "email",
        emailType: "templated",
      },
      extra: {
        to: Array.isArray(to) ? to : [to],
        subject,
      },
    });
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Send email using the email registry
 * Looks up the email type in EMAIL_TEMPLATES and sends using the configured template
 */
export async function sendEmailFromRegistry(
  type: string,
  payload: Record<string, unknown>,
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  const template = EMAIL_TEMPLATES[type as EmailEventType];

  if (!template) {
    const error = `Email template not found for type: ${type}`;
    console.warn(`[Email] ${error}`);
    return { success: false, error };
  }

  try {
    const recipients = template.getRecipients(payload);
    const subject = template.getSubject(payload);
    const textFallback = template.getTextFallback?.(payload);
    const react = template.render(payload);

    const result = await sendTemplatedEmail({
      to: recipients,
      subject,
      react,
      textFallback,
    });

    // Add registry tags to Sentry if email failed
    if (!result.success && template.tags) {
      Sentry.captureException(new Error(result.error || "Email send failed"), {
        tags: {
          component: "email",
          emailType: "registry",
          ...template.tags,
        },
        extra: {
          emailType: type,
          payload,
        },
      });
    }

    return result;
  } catch (error) {
    console.error(
      `[Email] Error sending email from registry (${type}):`,
      error,
    );
    Sentry.captureException(error as Error, {
      tags: {
        component: "email",
        emailType: "registry",
        ...template.tags,
      },
      extra: {
        emailType: type,
        payload,
      },
    });
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Legacy function for backward compatibility
 * @deprecated Use sendTemplatedEmail or sendEmailFromRegistry instead
 */
export async function sendEmailHTML(options: {
  to: string | string[];
  subject: string;
  html: string;
  from?: string;
}): Promise<{ success: boolean; messageId?: string }> {
  const { to, subject, html, from } = options;

  const client = getResendClient();
  if (!client) {
    console.warn("[Email] RESEND_API_KEY not set, skipping email send");
    return { success: false };
  }

  try {
    const actualTo = getActualRecipient(to);
    const { data, error } = await client.emails.send({
      from: from || process.env.RESEND_FROM_EMAIL || "noreply@unevent.ro",
      to: actualTo,
      subject,
      html,
    });

    if (error) {
      throw new Error(JSON.stringify(error));
    }

    return { success: true, messageId: data?.id };
  } catch (error) {
    console.error("[Email] Error:", error);
    Sentry.captureException(error as Error, {
      tags: { component: "email", emailType: "html" },
    });
    return { success: false };
  }
}
