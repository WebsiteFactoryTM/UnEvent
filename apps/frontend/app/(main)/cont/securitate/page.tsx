"use client";
import { SectionCard } from "@/components/cont/SectionCard";
import { FaLock, FaEnvelope, FaKey } from "react-icons/fa6";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useSession } from "next-auth/react";

export default function SecuritatePage() {
  const { data: session } = useSession();
  const user = session?.user;
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Change Password */}
      <SectionCard title="Schimbă Parola">
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground/80">
              Parola Curentă
            </label>
            <Input
              type="password"
              className="bg-muted/50 border-input text-foreground"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground/80">
              Parola Nouă
            </label>
            <Input
              type="password"
              className="bg-muted/50 border-input text-foreground"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground/80">
              Confirmă Parola Nouă
            </label>
            <Input
              type="password"
              className="bg-muted/50 border-input text-foreground"
            />
          </div>
          <div className="flex justify-end">
            <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
              Actualizează Parola
            </Button>
          </div>
        </div>
      </SectionCard>

      {/* Change Email */}
      <SectionCard title="Schimbă Email">
        <div className="space-y-4">
          <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
            <p className="text-sm text-muted-foreground">
              Email curent:{" "}
              <span className="font-semibold text-foreground">
                {user?.email}
              </span>
            </p>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground/80">
              Email Nou
            </label>
            <Input
              type="email"
              className="bg-muted/50 border-input text-foreground"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground/80">
              Parola Curentă
            </label>
            <Input
              type="password"
              className="bg-muted/50 border-input text-foreground"
            />
          </div>
          <div className="flex justify-end">
            <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
              Actualizează Email
            </Button>
          </div>
        </div>
      </SectionCard>

      {/* Delete Account */}
      <SectionCard title="Șterge Cont">
        <div className="space-y-4">
          <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
            <h4 className="font-semibold text-red-500 mb-2">Atenție!</h4>
            <p className="text-sm text-muted-foreground">
              Ștergerea contului este permanentă și nu poate fi anulată. Toate
              datele tale vor fi șterse definitiv.
            </p>
          </div>
          <Button variant="destructive" className="w-full">
            Șterge Contul Permanent
          </Button>
        </div>
      </SectionCard>
    </div>
  );
}
