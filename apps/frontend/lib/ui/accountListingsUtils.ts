import { City } from "@/types/payload-types";

export function getCityName(city: number | City | null | undefined): string {
  if (!city) return "N/A";
  if (typeof city === "object") return city.name;
  return "N/A";
}

// Helper to format date
export function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString("ro-RO", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

// Helper to get status badge color
export function getStatusColor(status: string | null | undefined): string {
  switch (status) {
    case "approved":
      return "bg-green-500/20 text-green-400 border-green-500/30";
    case "pending":
      return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
    case "rejected":
      return "bg-red-500/20 text-red-400 border-red-500/30";
    default:
      return "bg-muted text-muted-foreground border-border";
  }
}

// Helper to get status label
export function getStatusLabel(status: string | null | undefined): string {
  switch (status) {
    case "approved":
      return "Aprobat";
    case "pending":
      return "În așteptare";
    case "rejected":
      return "Respins";
    case "draft":
      return "Draft";
    default:
      return "Necunoscut";
  }
}
