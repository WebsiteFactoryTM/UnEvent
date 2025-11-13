"use server";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export async function uploadFile(
  file: File,
  token?: string,
  folder?: string,
  extra?: Record<string, any>,
) {
  if (!token) {
    throw new Error("Token is required");
  }
  try {
    const fd = new FormData();
    fd.append("file", file);
    // Payload expects additional fields under a single `data` JSON field
    if (extra || folder) {
      const data = { ...(extra || {}) };
      if (folder) (data as any).folder = folder; // eslint-disable-line @typescript-eslint/no-explicit-any
      fd.append("data", JSON.stringify(data));
    }

    console.log("token", token);

    const res = await fetch(`${API_URL}/api/media`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: fd,
    });
    if (!res.ok) {
      const text = await res.text().catch(() => "");
      throw new Error(text || "Upload failed");
    }
    return res.json();
  } catch (error) {
    console.error("Error uploading file:", error);
    throw error;
  }
}
