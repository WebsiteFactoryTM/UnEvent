"use client"

import { SectionCard } from "@/components/cont/SectionCard"
import { FaUser, FaCircleCheck, FaUpload } from "react-icons/fa6"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import Image from "next/image"

export default function ProfilPage() {
  // Mock data - will be replaced with real data
  const profile = {
    name: "Ana-Maria Popescu",
    email: "ana.popescu@example.com",
    phone: "+40 722 123 456",
    website: "www.anamariapopescu.ro",
    city: "București",
    bio: "Organizator de evenimente cu peste 10 ani experiență în domeniu. Specializat în evenimente corporate și nunți de lux.",
    avatar: "/professional-avatar.png",
    verified: false,
    verificationStatus: "pending",
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Profile Header */}
      <SectionCard title="Informații Profil" icon={FaUser}>
        <div className="space-y-6">
          {/* Avatar Upload */}
          <div className="flex items-center gap-6">
            <div className="relative">
              <Image
                src={profile.avatar || "/placeholder.svg"}
                alt={profile.name}
                width={96}
                height={96}
                className="w-24 h-24 rounded-full object-cover border-2 border-border"
              />
              <button className="absolute bottom-0 right-0 p-2 bg-muted hover:bg-muted/80 rounded-full transition-colors">
                <FaUpload className="w-3 h-3 text-muted-foreground" />
              </button>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-foreground">{profile.name}</h3>
              <p className="text-sm text-muted-foreground">Schimbă fotografia de profil</p>
            </div>
          </div>

          {/* Form Fields */}
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground/80">Nume Complet</label>
              <Input defaultValue={profile.name} className="bg-muted/50 border-input text-foreground" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground/80">Email</label>
              <Input
                defaultValue={profile.email}
                type="email"
                className="bg-muted/50 border-input text-foreground"
                disabled
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground/80">Telefon</label>
              <Input defaultValue={profile.phone} type="tel" className="bg-muted/50 border-input text-foreground" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground/80">Website</label>
              <Input defaultValue={profile.website} type="url" className="bg-muted/50 border-input text-foreground" />
            </div>
            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-medium text-foreground/80">Oraș</label>
              <Input defaultValue={profile.city} className="bg-muted/50 border-input text-foreground" />
            </div>
            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-medium text-foreground/80">Bio</label>
              <Textarea
                defaultValue={profile.bio}
                rows={4}
                className="bg-muted/50 border-input text-foreground resize-none"
              />
            </div>
          </div>

          <div className="flex justify-end">
            <Button className="bg-primary text-primary-foreground hover:bg-primary/90">Salvează Modificările</Button>
          </div>
        </div>
      </SectionCard>

      {/* Verification Section */}
      <SectionCard title="Verificare Cont" icon={FaCircleCheck}>
        <div className="space-y-4">
          <div className="flex items-start gap-4 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
            <div className="flex-shrink-0 w-10 h-10 bg-yellow-500/20 rounded-full flex items-center justify-center">
              <FaCircleCheck className="w-5 h-5 text-yellow-500" />
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-foreground mb-1">Verificare în Așteptare</h4>
              <p className="text-sm text-muted-foreground mb-3">
                Documentele tale sunt în curs de verificare. Vei primi un email când procesul este finalizat.
              </p>
              <p className="text-xs text-muted-foreground/70">Trimis la: 15 ianuarie 2025</p>
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="font-medium text-foreground">Beneficiile Verificării</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-center gap-2">
                <FaCircleCheck className="w-4 h-4 text-green-500" />
                Badge de verificare pe profil
              </li>
              <li className="flex items-center gap-2">
                <FaCircleCheck className="w-4 h-4 text-green-500" />
                Prioritate în rezultatele căutării
              </li>
              <li className="flex items-center gap-2">
                <FaCircleCheck className="w-4 h-4 text-green-500" />
                Acces la funcții premium
              </li>
              <li className="flex items-center gap-2">
                <FaCircleCheck className="w-4 h-4 text-green-500" />
                Încredere crescută din partea clienților
              </li>
            </ul>
          </div>
        </div>
      </SectionCard>
    </div>
  )
}
