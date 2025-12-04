"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { submitReport } from "@/lib/api/reports";

const REPORT_REASONS = [
  { value: "bad-language", label: "Limbaj neadecvat" },
  { value: "bad-experience", label: "Experiență negativă" },
  { value: "inappropriate-content", label: "Conținut neadecvat" },
  { value: "other", label: "Altul" },
] as const;

export type ReportReason = (typeof REPORT_REASONS)[number]["value"];

interface ReportDialogProps {
  trigger: React.ReactNode;
  type: "listing" | "profile";
  entityId: number;
  entityTitle: string;
  entityUrl: string;
  listingType?: "events" | "locations" | "services"; // Required when type is "listing"
}

export function ReportDialog({
  trigger,
  type,
  entityId,
  entityTitle,
  entityUrl,
  listingType,
}: ReportDialogProps) {
  const { data: session } = useSession();
  const accessToken = session?.accessToken;
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState<ReportReason | "">("");
  const [details, setDetails] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!reason) {
      toast({
        title: "Eroare",
        description: "Te rugăm să selectezi un motiv pentru raportare.",
        variant: "destructive",
      } as any);
      return;
    }

    if (!accessToken) {
      toast({
        title: "Autentificare necesară",
        description: "Trebuie să te autentifici pentru a trimite un raport.",
        variant: "destructive",
      } as any);
      return;
    }

    setIsSubmitting(true);

    try {
      await submitReport(
        {
          type,
          entityId,
          reason,
          details: details.trim() || undefined,
          ...(type === "listing" && listingType ? { listingType } : {}),
        },
        accessToken,
      );

      toast({
        title: "Raport trimis",
        description:
          "Mulțumim pentru raportare. Vom analiza cazul în cel mai scurt timp.",
      });

      // Reset form and close dialog
      setReason("");
      setDetails("");
      setOpen(false);
    } catch (error) {
      const err = error as any;
      const message =
        err?.message ||
        "Nu am putut trimite raportul. Te rugăm să încerci din nou.";

      toast({
        title: "Eroare",
        description: message,
        variant: "destructive",
      } as any);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            Raportează {type === "listing" ? "listarea" : "profilul"}
          </DialogTitle>
          <DialogDescription>
            Dacă ai identificat o problemă cu{" "}
            {type === "listing" ? "această listare" : "acest profil"}, te rugăm
            să ne informezi.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="report-reason">
              Motivul raportării <span className="text-destructive">*</span>
            </Label>
            <Select
              value={reason}
              onValueChange={(value) => setReason(value as ReportReason)}
              required
            >
              <SelectTrigger id="report-reason" className="w-full">
                <SelectValue placeholder="Selectează un motiv" />
              </SelectTrigger>
              <SelectContent>
                {REPORT_REASONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="report-details">
              Detalii suplimentare (opțional)
            </Label>
            <Textarea
              id="report-details"
              placeholder="Descrie problema în detaliu..."
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              className="min-h-[100px]"
              maxLength={1000}
            />
            <p className="text-xs text-muted-foreground">
              {details.length}/1000 caractere
            </p>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isSubmitting}
            >
              Anulează
            </Button>
            <Button type="submit" disabled={isSubmitting || !reason}>
              {isSubmitting ? "Se trimite..." : "Trimite raport"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
