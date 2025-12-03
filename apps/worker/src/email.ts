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
 * Validate email address format
 */
function isValidEmail(email: string): boolean {
  if (!email || typeof email !== "string") return false;
  const trimmed = email.trim();
  if (trimmed.length === 0) return false;
  // Basic email validation regex
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(trimmed);
}

/**
 * Sanitize and validate email addresses
 */
function sanitizeEmails(emails: string | string[]): string[] {
  const emailArray = Array.isArray(emails) ? emails : [emails];
  const validEmails: string[] = [];

  for (const email of emailArray) {
    if (!email || typeof email !== "string") {
      continue;
    }

    const trimmed = email.trim();
    if (trimmed.length === 0) {
      continue;
    }

    // Handle comma-separated emails in a single string
    if (trimmed.includes(",")) {
      const split = trimmed.split(",").map((e) => e.trim());
      for (const e of split) {
        if (isValidEmail(e)) {
          validEmails.push(e);
        }
      }
    } else if (isValidEmail(trimmed)) {
      validEmails.push(trimmed);
    }
  }

  return validEmails;
}

/**
 * Determine the actual recipient based on environment
 * In development, uses TEST_EMAIL to avoid Resend domain verification requirements
 */
function getActualRecipient(originalTo: string | string[]): string[] {
  const isProduction = process.env.NODE_ENV === "production";
  const testEmail = process.env.TEST_EMAIL;
  const overrideTo = process.env.RESEND_OVERRIDE_TO;

  // First, sanitize and validate the original recipients
  const sanitized = sanitizeEmails(originalTo);

  if (sanitized.length === 0) {
    throw new Error(
      `No valid email addresses found. Original: ${JSON.stringify(originalTo)}`,
    );
  }

  // In production, always send to real recipients (validated)
  if (isProduction) {
    return sanitized;
  }

  // In development, use TEST_EMAIL if set (for Resend testing without domain verification)
  if (testEmail) {
    const testEmailSanitized = sanitizeEmails(testEmail);
    if (testEmailSanitized.length === 0) {
      throw new Error(`TEST_EMAIL is set but invalid: ${testEmail}`);
    }
    return testEmailSanitized;
  }

  // Fallback to RESEND_OVERRIDE_TO if TEST_EMAIL is not set
  if (overrideTo) {
    const overrideSanitized = sanitizeEmails(overrideTo);
    if (overrideSanitized.length === 0) {
      throw new Error(`RESEND_OVERRIDE_TO is set but invalid: ${overrideTo}`);
    }
    return overrideSanitized;
  }

  // No override set - send to real recipients (may fail in dev without domain verification)
  console.warn(
    `[Email] ⚠️ No TEST_EMAIL or RESEND_OVERRIDE_TO set in development. Sending to real recipients (may fail without domain verification): ${sanitized.join(", ")}`,
  );
  return sanitized;
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

    // Validate each email one more time before sending
    for (let i = 0; i < actualTo.length; i++) {
      const email = actualTo[i];
      if (!email || typeof email !== "string") {
        throw new Error(
          `Invalid email type at index ${i}: ${JSON.stringify(email)}`,
        );
      }
      if (!isValidEmail(email)) {
        throw new Error(
          `Invalid email format at index ${i}: ${JSON.stringify(email)}`,
        );
      }
    }

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

      // Handle Resend API restrictions in development
      const errorMessage =
        typeof error === "string" ? error : JSON.stringify(error);
      const isResendRestriction =
        errorMessage.includes("You can only send testing emails") ||
        errorMessage.includes("verify a domain");

      if (isResendRestriction && process.env.NODE_ENV !== "production") {
        console.warn(
          `[Email] ⚠️ Resend API restriction in development. Set TEST_EMAIL or RESEND_OVERRIDE_TO to avoid this error.`,
        );
        console.warn(
          `[Email] Would have sent to: ${actualTo.join(", ")}, subject: ${subject}`,
        );
        // In dev, don't fail - just log
        return {
          success: false,
          error: `Resend API restriction: ${errorMessage}. Set TEST_EMAIL env var to test emails.`,
        };
      }

      Sentry.captureException(new Error(`Resend error: ${errorMessage}`), {
        tags: {
          component: "email",
          emailType: "templated",
        },
        extra: {
          to: actualTo,
          subject,
          error,
        },
      });
      return { success: false, error: errorMessage };
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
  try {
    const template = EMAIL_TEMPLATES[type as EmailEventType];

    if (!template) {
      const error = `Email template not found for type: ${type}`;
      console.warn(`[Email] ${error}`);
      return { success: false, error };
    }

    let recipients: string | string[];
    try {
      recipients = template.getRecipients(payload);

      // Validate recipients format before proceeding
      if (!recipients) {
        throw new Error(`getRecipients returned null/undefined for ${type}`);
      }
      if (typeof recipients !== "string" && !Array.isArray(recipients)) {
        throw new Error(
          `getRecipients returned invalid type for ${type}: ${typeof recipients}. Expected string or string[]`,
        );
      }
      if (Array.isArray(recipients) && recipients.length === 0) {
        throw new Error(`getRecipients returned empty array for ${type}`);
      }
      if (typeof recipients === "string" && recipients.trim().length === 0) {
        throw new Error(`getRecipients returned empty string for ${type}`);
      }

      // Additional validation for array contents
      if (Array.isArray(recipients)) {
        for (let i = 0; i < recipients.length; i++) {
          const email = recipients[i];
          if (!email || typeof email !== "string") {
            throw new Error(
              `getRecipients returned array with invalid item at index ${i} for ${type}: ${JSON.stringify(email)}`,
            );
          }
        }
      }
    } catch (recipientError) {
      console.error(
        `[Email] Error in getRecipients for ${type}:`,
        recipientError,
      );
      throw new Error(
        `Failed to get recipients: ${recipientError instanceof Error ? recipientError.message : String(recipientError)}`,
      );
    }

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

    // Get template for tags if available
    const templateForTags = EMAIL_TEMPLATES[type as EmailEventType];

    Sentry.captureException(error as Error, {
      tags: {
        component: "email",
        emailType: "registry",
        ...(templateForTags?.tags || {}),
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
