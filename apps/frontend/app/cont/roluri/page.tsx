"use client"

import { SectionCard } from "@/components/cont/SectionCard"
import { FaUserShield, FaCircleCheck, FaClock } from "react-icons/fa6"
import { Button } from "@/components/ui/button"

export default function RoluriPage() {
  // Mock data
  const activeRoles = ["client"]
  const pendingRoles = ["organizer"]
  const availableRoles = [
    {
      id: "host",
      name: "Gazdă Locație",
      description: "Listează și gestionează locații pentru evenimente",
      benefits: ["Adaugă locații", "Primește rezervări", "Gestionează calendar"],
    },
    {
      id: "provider",
      name: "Furnizor Servicii",
      description: "Oferă servicii pentru evenimente (catering, foto-video, etc.)",
      benefits: ["Adaugă servicii", "Primește solicitări", "Portofoliu online"],
    },
  ]

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Active Roles */}
      <SectionCard title="Roluri Active" icon={FaUserShield}>
        <div className="space-y-3">
          {activeRoles.map((role) => (
            <div
              key={role}
              className="flex items-center justify-between p-4 bg-green-500/10 border border-green-500/20 rounded-lg"
            >
              <div className="flex items-center gap-3">
                <FaCircleCheck className="w-5 h-5 text-green-500" />
                <div>
                  <h4 className="font-semibold text-foreground capitalize">{role === "client" ? "Client" : role}</h4>
                  <p className="text-sm text-muted-foreground">Rol activ</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </SectionCard>

      {/* Pending Roles */}
      {pendingRoles.length > 0 && (
        <SectionCard title="Cereri în Așteptare" icon={FaClock}>
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
                    <p className="text-sm text-muted-foreground">În curs de verificare</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </SectionCard>
      )}

      {/* Available Roles */}
      <SectionCard title="Roluri Disponibile" icon={FaUserShield}>
        <div className="space-y-4">
          {availableRoles.map((role) => (
            <div key={role.id} className="p-4 bg-muted/50 border border-border rounded-lg space-y-3">
              <div>
                <h4 className="font-semibold text-foreground mb-1">{role.name}</h4>
                <p className="text-sm text-muted-foreground">{role.description}</p>
              </div>
              <ul className="space-y-1">
                {role.benefits.map((benefit, idx) => (
                  <li key={idx} className="flex items-center gap-2 text-sm text-muted-foreground">
                    <FaCircleCheck className="w-3 h-3 text-green-500" />
                    {benefit}
                  </li>
                ))}
              </ul>
              <Button variant="outline" className="w-full bg-transparent">
                Solicită Rol
              </Button>
            </div>
          ))}
        </div>
      </SectionCard>
    </div>
  )
}
