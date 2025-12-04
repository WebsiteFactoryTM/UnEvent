export interface SubmitReportPayload {
  type: "listing" | "profile";
  entityId: number;
  reason: string;
  details?: string;
  listingType?: "events" | "locations" | "services"; // Required when type is "listing"
}

export async function submitReport(
  payload: SubmitReportPayload,
  accessToken?: string,
): Promise<void> {
  const apiBase = process.env.NEXT_PUBLIC_API_URL;
  if (!apiBase) {
    throw new Error("NEXT_PUBLIC_API_URL is not configured");
  }

  if (!accessToken) {
    throw new Error("Autentificare necesară pentru a trimite un raport");
  }

  const response = await fetch(`${apiBase}/api/report`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify(payload),
    cache: "no-store",
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const errorMessage =
      errorData.errors?.map((err: any) => err.message).join(", ") ||
      errorData.message ||
      errorData.error ||
      "Nu am putut trimite raportul. Te rugăm să încerci din nou.";

    const error = new Error(errorMessage) as any;
    error.status = response.status;
    throw error;
  }

  // Success - no body expected
}
