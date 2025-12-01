import Link from "next/link";
import { SectionCard } from "@/components/cont/SectionCard";
import { Button } from "@/components/ui/button";
import { FaUserShield, FaArrowRight } from "react-icons/fa6";

interface NoRoleAccessProps {
  requiredRole: "organizer" | "host" | "provider";
  pageName: string;
}

const roleMessages: Record<NoRoleAccessProps["requiredRole"], string> = {
  organizer:
    "Pentru a gestiona evenimentele, trebuie să ai rolul de organizator de evenimente.",
  host: "Pentru a gestiona locațiile, trebuie să ai rolul de proprietar locație.",
  provider:
    "Pentru a gestiona serviciile, trebuie să ai rolul de furnizor servicii.",
};

const roleLabels: Record<NoRoleAccessProps["requiredRole"], string> = {
  organizer: "Organizator de evenimente",
  host: "Proprietar locație",
  provider: "Furnizor servicii",
};

export function NoRoleAccess({ requiredRole, pageName }: NoRoleAccessProps) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
          {pageName}
        </h1>
        <p className="text-muted-foreground mt-1 text-sm sm:text-base">
          Acces restricționat
        </p>
      </div>

      <SectionCard
        title="Rol necesar"
        description={`Pentru a accesa această pagină, ai nevoie de rolul de ${roleLabels[requiredRole].toLowerCase()}.`}
      >
        <div className="space-y-4">
          <div className="flex items-start gap-4 p-4 bg-muted/50 border border-border rounded-lg">
            <FaUserShield className="w-6 h-6 text-muted-foreground shrink-0 mt-0.5" />
            <div className="space-y-2 flex-1">
              <p className="text-foreground">{roleMessages[requiredRole]}</p>
              <p className="text-sm text-muted-foreground">
                Poți solicita acest rol din pagina de gestionare a rolurilor.
              </p>
            </div>
          </div>

          <div className="flex gap-3">
            <Link href="/cont/roluri" className="flex-1">
              <Button className="w-full gap-2">
                Gestionează rolurile
                <FaArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/cont">
              <Button variant="secondary">Înapoi la cont</Button>
            </Link>
          </div>
        </div>
      </SectionCard>
    </div>
  );
}
