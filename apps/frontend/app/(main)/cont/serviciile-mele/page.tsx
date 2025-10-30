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
import {
  FaUtensils,
  FaCamera,
  FaMusic,
  FaPalette,
  FaEnvelope,
  FaCar,
  FaGift,
  FaCakeCandles,
} from "react-icons/fa6";
import { SectionCard } from "@/components/cont/SectionCard";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { mockMyServices, type MyService } from "@/mocks/cont/my-services";
import { AddServiceModal } from "@/components/cont/services/AddServiceModal";
import type { City } from "@/types/payload-types copy";

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
    case "sponsored":
      return "bg-blue-500/20 text-blue-400 border-blue-500/30";
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
    case "sponsored":
      return "Sponsorizat";
    default:
      return "Necunoscut";
  }
}

function getCategoryIcon(category: string | null | undefined) {
  switch (category?.toLowerCase()) {
    case "catering":
      return <FaUtensils className="h-4 w-4" />;
    case "fotografie":
      return <FaCamera className="h-4 w-4" />;
    case "muzică":
    case "dj":
      return <FaMusic className="h-4 w-4" />;
    case "decorațiuni":
      return <FaPalette className="h-4 w-4" />;
    case "papetărie":
    case "invitații":
      return <FaEnvelope className="h-4 w-4" />;
    case "transport":
      return <FaCar className="h-4 w-4" />;
    case "cadouri":
      return <FaGift className="h-4 w-4" />;
    case "tort":
    case "cofetărie":
      return <FaCakeCandles className="h-4 w-4" />;
    default:
      return null;
  }
}

function getCategoryColor(category: string | null | undefined): string {
  switch (category?.toLowerCase()) {
    case "catering":
      return "bg-orange-500/20 text-orange-400 border-orange-500/30";
    case "fotografie":
      return "bg-purple-500/20 text-purple-400 border-purple-500/30";
    case "muzică":
    case "dj":
      return "bg-pink-500/20 text-pink-400 border-pink-500/30";
    case "decorațiuni":
      return "bg-green-500/20 text-green-400 border-green-500/30";
    case "papetărie":
    case "invitații":
      return "bg-blue-500/20 text-blue-400 border-blue-500/30";
    case "transport":
      return "bg-gray-500/20 text-gray-400 border-gray-500/30";
    case "cadouri":
      return "bg-red-500/20 text-red-400 border-red-500/30";
    case "tort":
    case "cofetărie":
      return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
    default:
      return "bg-muted text-muted-foreground border-border";
  }
}

export default function ServiciilemePage() {
  const { toast } = useToast();
  const [services] = useState<MyService[]>(mockMyServices);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const handleView = (service: MyService) => {
    toast({
      title: "Vezi serviciu",
      description: `Vizualizare: ${service.title}`,
    });
  };

  const handleEdit = (service: MyService) => {
    toast({
      title: "Editează serviciu",
      description: `Editare: ${service.title}`,
    });
  };

  const handleDelete = (service: MyService) => {
    toast({
      title: "Șterge serviciu",
      description: `Ștergere: ${service.title}`,
      variant: "destructive",
    });
  };

  const handleAddService = () => {
    setIsAddModalOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
            Serviciile mele
          </h1>
          <p className="text-muted-foreground mt-1 text-sm sm:text-base">
            Gestionează serviciile tale listate pe platformă
          </p>
        </div>
        <Button onClick={handleAddService} className="gap-2 w-full sm:w-auto">
          <FaPlus className="h-4 w-4" />
          Adaugă serviciu
        </Button>
      </div>

      {/* Services List */}
      <SectionCard
        title="Lista serviciilor"
        description="Toate serviciile tale"
      >
        {/* Desktop Table View */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-3 px-4 text-sm font-semibold text-foreground">
                  Titlu
                </th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-foreground">
                  Categorie
                </th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-foreground">
                  Scurtă descriere
                </th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-foreground">
                  Oraș
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
              {services.map((service) => (
                <tr
                  key={service.id}
                  className="border-b border-border/50 hover:bg-muted/50 transition-colors"
                >
                  <td className="py-4 px-4">
                    <div className="font-medium text-foreground">
                      {service.title}
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    {service.category && (
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border ${getCategoryColor(
                          service.category,
                        )}`}
                      >
                        {getCategoryIcon(service.category)}
                        {service.category}
                      </span>
                    )}
                  </td>
                  <td className="py-4 px-4">
                    <div className="text-sm text-muted-foreground max-w-xs truncate">
                      {service.description}
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <div className="text-sm text-foreground">
                      {getCityName(service.city)}
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <div className="text-sm text-muted-foreground">
                      {formatDate(service.createdAt)}
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <div className="text-sm text-foreground font-medium">
                      {service.views?.toLocaleString() || 0}
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(
                        service.status,
                      )}`}
                    >
                      {getStatusLabel(service.status)}
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleView(service)}
                        className="h-8 w-8 p-0"
                      >
                        <FaEye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(service)}
                        className="h-8 w-8 p-0"
                      >
                        <FaPencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(service)}
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

          {services.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground">
                Nu ai încă servicii adăugate.
              </p>
              <Button onClick={handleAddService} className="mt-4 gap-2">
                <FaPlus className="h-4 w-4" />
                Adaugă primul serviciu
              </Button>
            </div>
          )}
        </div>

        {/* Mobile Card View */}
        <div className="md:hidden space-y-4">
          {services.map((service) => (
            <div
              key={service.id}
              className="p-4 rounded-lg bg-muted/30 border border-border/50 backdrop-blur-sm space-y-3"
            >
              {/* Title, Category and Status */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 space-y-2">
                  <h3 className="font-semibold text-foreground text-lg">
                    {service.title}
                  </h3>
                  {service.category && (
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border ${getCategoryColor(
                        service.category,
                      )}`}
                    >
                      {getCategoryIcon(service.category)}
                      {service.category}
                    </span>
                  )}
                </div>
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border whitespace-nowrap ${getStatusColor(
                    service.status,
                  )}`}
                >
                  {getStatusLabel(service.status)}
                </span>
              </div>

              {/* Description */}
              <p className="text-sm text-muted-foreground line-clamp-2">
                {service.description}
              </p>

              {/* Meta Information */}
              <div className="grid grid-cols-2 gap-3 pt-2 border-t border-border/30">
                <div className="flex items-center gap-2 text-sm">
                  <FaLocationDot className="h-4 w-4 text-muted-foreground" />
                  <span className="text-foreground">
                    {getCityName(service.city)}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <FaChartLine className="h-4 w-4 text-muted-foreground" />
                  <span className="text-foreground font-medium">
                    {service.views?.toLocaleString() || 0}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm col-span-2">
                  <FaCalendarDays className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">
                    {formatDate(service.createdAt)}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleView(service)}
                  className="flex-1 gap-2 text-xs"
                >
                  <FaEye className="h-3 w-3" />
                  Vezi
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleEdit(service)}
                  className="flex-1 gap-2 text-xs"
                >
                  <FaPencil className="h-3 w-3" />
                  Editează
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDelete(service)}
                  className="gap-2 text-xs text-red-400 hover:text-red-300 hover:bg-red-500/10 border-red-500/30"
                >
                  <FaTrash className="h-3 w-3" />
                </Button>
              </div>
            </div>
          ))}

          {services.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground">
                Nu ai încă servicii adăugate.
              </p>
              <Button onClick={handleAddService} className="mt-4 gap-2 w-full">
                <FaPlus className="h-4 w-4" />
                Adaugă primul serviciu
              </Button>
            </div>
          )}
        </div>
      </SectionCard>

      {/* Rejection Reason Alert (if any rejected) */}
      {services.some((s) => s.status === "rejected") && (
        <SectionCard
          title="Servicii respinse"
          description="Servicii care necesită atenție"
        >
          <div className="space-y-4">
            {services
              .filter((s) => s.status === "rejected")
              .map((service) => (
                <div
                  key={service.id}
                  className="p-4 rounded-lg bg-red-500/10 border border-red-500/30"
                >
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold text-foreground">
                          {service.title}
                        </h3>
                        {service.category && (
                          <span
                            className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium border ${getCategoryColor(
                              service.category,
                            )}`}
                          >
                            {getCategoryIcon(service.category)}
                            {service.category}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        <span className="font-medium text-red-400">
                          Motiv respingere:
                        </span>{" "}
                        {service.rejectionReason ||
                          "Nu a fost specificat un motiv."}
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(service)}
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

      {/* Add Service Modal */}
      <AddServiceModal open={isAddModalOpen} onOpenChange={setIsAddModalOpen} />
    </div>
  );
}
