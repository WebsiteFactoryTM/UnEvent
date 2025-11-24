import { createHash } from "node:crypto";

export function generateETag(payload: string): string {
  const hash = createHash("sha256").update(payload).digest("base64");
  return `W/"${hash}"`;
}
