"use client";

import { SectionCard } from "@/components/cont/SectionCard";
import { FaUserShield, FaCircleCheck, FaClock, FaXmark } from "react-icons/fa6";
import { Button } from "@/components/ui/button";
import { useSession } from "next-auth/react";
import { useState } from "react";
import { changeRole } from "@/lib/api/roles";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import Link from "next/link";

const ALL_ROLES = [
  {
    id: "organizer",
    name: "Organizator Evenimente",
    description: "Organizează, promovează și gestionează evenimente",
    benefits: [
      "Adaugă evenimente",
      "Gestionează participanți",
      "Promovează evenimente",
    ],
  },
  {
    id: "host",
    name: "Gazdă Locație",
    description: "Listează și gestionează locații pentru evenimente",
    benefits: ["Adaugă locații", "Primește rezervări", "Gestionează calendar"],
  },
  {
    id: "provider",
    name: "Furnizor Servicii",
    description:
      "Oferă servicii pentru evenimente (catering, foto-video, etc.)",
    benefits: ["Adaugă servicii", "Primește solicitări", "Portofoliu online"],
  },
] as const;

export default function RoluriPage() {
  const { data: session, update } = useSession();
  const { toast } = useToast();
  const [loadingRoles, setLoadingRoles] = useState<Set<string>>(new Set());

  const userRoles = session?.user?.roles || [];
  const accessToken = session?.accessToken;

  // Active roles (excluding client for display, but client is always present)
  const activeRoles = userRoles.filter((role) => role !== "client");
  const pendingRoles: string[] = []; // Empty for now, can be added later

  // Available roles are all roles that user doesn't have
  const availableRoles = ALL_ROLES.filter(
    (role) => !userRoles.includes(role.id),
  );

  const handleRoleChange = async (roleId: string, action: "add" | "remove") => {
    if (!accessToken) {
      toast({
        title: "Eroare",
        description: (
          <>
            Nu ești autentificat.{" "}
            <Link
              href="/auth/autentificare"
              className="underline font-semibold hover:text-primary"
            >
              Loghează-te acum
            </Link>
            .
          </>
        ),
        variant: "destructive",
      });
      return;
    }

    setLoadingRoles((prev) => new Set(prev).add(roleId));

    try {
      await changeRole(roleId, action, accessToken);

      // Refresh session to get updated roles
      await update();

      toast({
        title: "Succes",
        description:
          action === "add"
            ? "Rolul a fost adăugat cu succes."
            : "Rolul a fost eliminat cu succes.",
        variant: "success",
      });
    } catch (error) {
      toast({
        title: "Eroare",
        description:
          error instanceof Error
            ? error.message
            : "Eroare la schimbarea rolului.",
        variant: "destructive",
      });
    } finally {
      setLoadingRoles((prev) => {
        const next = new Set(prev);
        next.delete(roleId);
        return next;
      });
    }
  };

  const getRoleLabel = (role: string) => {
    const labels: Record<string, string> = {
      client: "Client / Participant",
      host: "Proprietar locație",
      provider: "Furnizor servicii",
      organizer: "Organizator evenimente",
      admin: "Administrator",
    };
    return labels[role] || role;
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Active Roles */}
      <SectionCard title="Roluri Active">
        <div className="space-y-3">
          {/* Always show client role */}
          <div className="flex items-center justify-between p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
            <div className="flex items-center gap-3">
              <FaCircleCheck className="w-5 h-5 text-green-500" />
              <div>
                <h4 className="font-semibold text-foreground">
                  Client / Participant
                </h4>
                <p className="text-sm text-muted-foreground">
                  Rol activ (obligatoriu)
                </p>
              </div>
            </div>
          </div>

          {/* Other active roles */}
          {activeRoles.map((role) => (
            <div
              key={role}
              className="flex items-center justify-between p-4 bg-green-500/10 border border-green-500/20 rounded-lg"
            >
              <div className="flex items-center gap-3">
                <FaCircleCheck className="w-5 h-5 text-green-500" />
                <div>
                  <h4 className="font-semibold text-foreground">
                    {getRoleLabel(role)}
                  </h4>
                  <p className="text-sm text-muted-foreground">Rol activ</p>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleRoleChange(role, "remove")}
                disabled={loadingRoles.has(role)}
                className="gap-2"
              >
                {loadingRoles.has(role) ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Elimină...
                  </>
                ) : (
                  <>
                    <FaXmark className="h-4 w-4" />
                    Elimină
                  </>
                )}
              </Button>
            </div>
          ))}

          {activeRoles.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-4">
              Nu ai alte roluri active în afară de Client.
            </p>
          )}
        </div>
      </SectionCard>

      {/* Pending Roles */}
      {pendingRoles.length > 0 && (
        <SectionCard title="Cereri în Așteptare">
          <div className="space-y-3">
            {pendingRoles.map((role) => (
              <div
                key={role}
                className="flex items-center justify-between p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <FaClock className="w-5 h-5 text-yellow-500" />
                  <div>
                    <h4 className="font-semibold text-foreground capitalize">
                      {role === "organizer" ? "Organizator Evenimente" : role}
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      În curs de verificare
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </SectionCard>
      )}

      {/* Available Roles */}
      {availableRoles.length > 0 && (
        <SectionCard title="Roluri Disponibile">
          <div className="space-y-4">
            {availableRoles.map((role) => (
              <div
                key={role.id}
                className="p-4 bg-muted/50 border border-border rounded-lg space-y-3"
              >
                <div>
                  <h4 className="font-semibold text-foreground mb-1">
                    {role.name}
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    {role.description}
                  </p>
                </div>
                <ul className="space-y-1">
                  {role.benefits.map((benefit, idx) => (
                    <li
                      key={idx}
                      className="flex items-center gap-2 text-sm text-muted-foreground"
                    >
                      <FaCircleCheck className="w-3 h-3 text-green-500" />
                      {benefit}
                    </li>
                  ))}
                </ul>
                <Button
                  variant="outline"
                  className="w-full bg-transparent"
                  onClick={() => handleRoleChange(role.id, "add")}
                  disabled={loadingRoles.has(role.id)}
                >
                  {loadingRoles.has(role.id) ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Se procesează...
                    </>
                  ) : (
                    "Solicită Rol"
                  )}
                </Button>
              </div>
            ))}
          </div>
        </SectionCard>
      )}

      {availableRoles.length === 0 && activeRoles.length > 0 && (
        <SectionCard title="Roluri Disponibile">
          <p className="text-sm text-muted-foreground text-center py-4">
            Ai toate rolurile disponibile.
          </p>
        </SectionCard>
      )}
    </div>
  );
}
