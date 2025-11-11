export async function uploadFile(
  file: File,
  token?: string,
  folder?: string,
  extra?: Record<string, any>,
) {
  const fd = new FormData();
  fd.append("file", file);
  if (folder) fd.append("folder", folder);
  if (extra) {
    for (const [k, v] of Object.entries(extra)) {
      fd.append(k, typeof v === "string" ? v : JSON.stringify(v));
    }
  }
  const base = process.env.NEXT_PUBLIC_API_URL;
  if (!base) throw new Error("Missing NEXT_PUBLIC_API_URL");
  const res = await fetch(`${base}/api/media`, {
    method: "POST",
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    body: fd,
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(text || "Upload failed");
  }
  return res.json();
}
