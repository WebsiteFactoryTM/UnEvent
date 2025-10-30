"use client";

import { useState } from "react";
import {
  FaEye,
  FaPencil,
  FaTrash,
  FaPlus,
  FaLocationDot,
  FaCalendarDays,
  FaChartLine,
} from "react-icons/fa6";
import { SectionCard } from "@/components/cont/SectionCard";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { mockMyLocations } from "@/mocks/cont/my-locations";
import { AddLocationModal } from "@/components/cont/locations/AddLocationModal";
import type { Location, City } from "@/types/payload-types copy";

// Helper to get city name from City object or ID
function getCityName(city: number | City | null | undefined): string {
  if (!city) return "N/A";
  if (typeof city === "object") return city.name;
  return "N/A";
}

// Helper to format date
function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString("ro-RO", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

// Helper to get status badge color
function getStatusColor(status: string | null | undefined): string {
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
function getStatusLabel(status: string | null | undefined): string {
  switch (status) {
    case "approved":
      return "Aprobat";
    case "pending":
      return "În așteptare";
    case "rejected":
      return "Respins";
    default:
      return "Necunoscut";
  }
}

export default function LocatiilemePage() {
  const { toast } = useToast();
  const [locations] = useState<Location[]>(mockMyLocations);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const handleView = (location: Location) => {
    toast({
      title: "Vezi locație",
      description: `Vizualizare: ${location.title}`,
    });
  };

  const handleEdit = (location: Location) => {
    toast({
      title: "Editează locație",
      description: `Editare: ${location.title}`,
    });
  };

  const handleDelete = (location: Location) => {
    toast({
      title: "Șterge locație",
      description: `Ștergere: ${location.title}`,
      variant: "destructive",
    });
  };

  const handleAddLocation = () => {
    setIsAddModalOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
            Locațiile mele
          </h1>
          <p className="text-muted-foreground mt-1 text-sm sm:text-base">
            Gestionează locațiile tale listate pe platformă
          </p>
        </div>
        <Button onClick={handleAddLocation} className="gap-2 w-full sm:w-auto">
          <FaPlus className="h-4 w-4" />
          Adaugă locație
        </Button>
      </div>

      {/* Locations List */}
      <SectionCard title="Lista locațiilor" description="Toate locațiile tale">
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-3 px-4 text-sm font-semibold text-foreground">
                  Titlu
                </th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-foreground">
                  Scurtă descriere
                </th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-foreground">
                  Locație (oraș)
                </th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-foreground">
                  Data creării
                </th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-foreground">
                  Vizualizări
                </th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-foreground">
                  Status
                </th>
                <th className="text-right py-3 px-4 text-sm font-semibold text-foreground">
                  Acțiuni
                </th>
              </tr>
            </thead>
            <tbody>
              {locations.map((location) => (
                <tr
                  key={location.id}
                  className="border-b border-border/50 hover:bg-muted/50 transition-colors"
                >
                  <td className="py-4 px-4">
                    <div className="font-medium text-foreground">
                      {location.title}
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <div className="text-sm text-muted-foreground max-w-xs truncate">
                      {location.description}
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <div className="text-sm text-foreground">
                      {getCityName(location.city)}
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <div className="text-sm text-muted-foreground">
                      {formatDate(location.createdAt)}
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <div className="text-sm text-foreground font-medium">
                      {location.views?.toLocaleString() || 0}
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(
                        location.status,
                      )}`}
                    >
                      {getStatusLabel(location.status)}
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleView(location)}
                        className="h-8 w-8 p-0"
                      >
                        <FaEye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(location)}
                        className="h-8 w-8 p-0"
                      >
                        <FaPencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(location)}
                        className="h-8 w-8 p-0 text-red-400 hover:text-red-300 hover:bg-red-500/10"
                      >
                        <FaTrash className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {locations.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground">
                Nu ai încă locații adăugate.
              </p>
              <Button onClick={handleAddLocation} className="mt-4 gap-2">
                <FaPlus className="h-4 w-4" />
                Adaugă prima locație
              </Button>
            </div>
          )}
        </div>

        <div className="md:hidden space-y-4">
          {locations.map((location) => (
            <div
              key={location.id}
              className="p-4 rounded-lg bg-muted/30 border border-border/50 backdrop-blur-sm space-y-3"
            >
              {/* Title and Status */}
              <div className="flex items-start justify-between gap-3">
                <h3 className="font-semibold text-foreground text-lg flex-1">
                  {location.title}
                </h3>
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border whitespace-nowrap ${getStatusColor(
                    location.status,
                  )}`}
                >
                  {getStatusLabel(location.status)}
                </span>
              </div>

              {/* Description */}
              <p className="text-sm text-muted-foreground line-clamp-2">
                {location.description}
              </p>

              {/* Meta Information */}
              <div className="grid grid-cols-2 gap-3 pt-2 border-t border-border/30">
                <div className="flex items-center gap-2 text-sm">
                  <FaLocationDot className="h-4 w-4 text-muted-foreground" />
                  <span className="text-foreground">
                    {getCityName(location.city)}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <FaChartLine className="h-4 w-4 text-muted-foreground" />
                  <span className="text-foreground font-medium">
                    {location.views?.toLocaleString() || 0}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm col-span-2">
                  <FaCalendarDays className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">
                    {formatDate(location.createdAt)}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleView(location)}
                  className="flex-1 gap-2 text-xs"
                >
                  <FaEye className="h-3 w-3" />
                  Vezi
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleEdit(location)}
                  className="flex-1 gap-2 text-xs"
                >
                  <FaPencil className="h-3 w-3" />
                  Editează
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDelete(location)}
                  className="gap-2 text-xs text-red-400 hover:text-red-300 hover:bg-red-500/10 border-red-500/30"
                >
                  <FaTrash className="h-3 w-3" />
                </Button>
              </div>
            </div>
          ))}

          {locations.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground">
                Nu ai încă locații adăugate.
              </p>
              <Button onClick={handleAddLocation} className="mt-4 gap-2 w-full">
                <FaPlus className="h-4 w-4" />
                Adaugă prima locație
              </Button>
            </div>
          )}
        </div>
      </SectionCard>

      {/* Rejection Reason Alert (if any rejected) */}
      {locations.some((l) => l.status === "rejected") && (
        <SectionCard
          title="Locații respinse"
          description="Locații care necesită atenție"
        >
          <div className="space-y-4">
            {locations
              .filter((l) => l.status === "rejected")
              .map((location) => (
                <div
                  key={location.id}
                  className="p-4 rounded-lg bg-red-500/10 border border-red-500/30"
                >
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                    <div className="flex-1">
                      <h3 className="font-semibold text-foreground">
                        {location.title}
                      </h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        <span className="font-medium text-red-400">
                          Motiv respingere:
                        </span>{" "}
                        {location.rejectionReason ||
                          "Nu a fost specificat un motiv."}
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(location)}
                      className="gap-2 w-full sm:w-auto"
                    >
                      <FaPencil className="h-3 w-3" />
                      Corectează
                    </Button>
                  </div>
                </div>
              ))}
          </div>
        </SectionCard>
      )}

      {/* Add Location Modal */}
      <AddLocationModal
        open={isAddModalOpen}
        onOpenChange={setIsAddModalOpen}
      />
    </div>
  );
}
