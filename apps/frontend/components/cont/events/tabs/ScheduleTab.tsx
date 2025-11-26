"use client";

import { useFormContext, Controller } from "react-hook-form";
import { useEffect } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { Calendar, Clock } from "lucide-react";
import type { EventFormData } from "@/forms/listing/schema";

export function ScheduleTab() {
  const {
    register,
    control,
    watch,

    formState: { errors },
  } = useFormContext<EventFormData>();

  const allDayEvent = watch("allDayEvent");

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-2">Program eveniment</h3>
        <p className="text-sm text-muted-foreground">
          Setează data și ora evenimentului pentru a informa participanții.
        </p>
      </div>

      {/* All Day Event Toggle */}
      <div className="flex items-center space-x-2">
        <Controller
          control={control}
          name="allDayEvent"
          render={({ field }) => (
            <Checkbox
              id="all-day"
              checked={field.value}
              onCheckedChange={field.onChange}
            />
          )}
        />
        <Label htmlFor="all-day" className="cursor-pointer font-medium">
          Eveniment pe toată ziua
        </Label>
      </div>

      <Separator />

      {allDayEvent ? (
        // All-day event: single date picker
        <div className="space-y-2">
          <Label
            htmlFor="start-date"
            className="required flex items-center gap-2"
          >
            <Calendar className="h-4 w-4" />
            Data evenimentului
          </Label>
          <Input
            id="start-date"
            type="date"
            {...register("startDate")}
            aria-invalid={errors.startDate ? "true" : "false"}
            aria-describedby={errors.startDate ? "start-date-error" : undefined}
          />
          {errors.startDate && (
            <p id="start-date-error" className="text-sm text-destructive">
              {errors.startDate.message}
            </p>
          )}
          <p className="text-xs text-muted-foreground">
            Evenimentul va dura toată ziua
          </p>
        </div>
      ) : (
        // Timed event: start and end date/time
        <div className="space-y-6">
          {/* Start Date & Time */}
          <div className="space-y-4">
            <h4 className="font-medium">Început eveniment</h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label
                  htmlFor="start-date"
                  className="required flex items-center gap-2"
                >
                  <Calendar className="h-4 w-4" />
                  Data început
                </Label>
                <Input
                  id="start-date"
                  type="date"
                  {...register("startDate")}
                  aria-invalid={errors.startDate ? "true" : "false"}
                  aria-describedby={
                    errors.startDate ? "start-date-error" : undefined
                  }
                />
                {errors.startDate && (
                  <p id="start-date-error" className="text-sm text-destructive">
                    {errors.startDate.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="start-time"
                  className="required flex items-center gap-2"
                >
                  <Clock className="h-4 w-4" />
                  Ora început
                </Label>
                <Input
                  id="start-time"
                  type="time"
                  {...register("startTime")}
                  aria-invalid={errors.startTime ? "true" : "false"}
                  aria-describedby={
                    errors.startTime ? "start-time-error" : undefined
                  }
                />
                {errors.startTime && (
                  <p id="start-time-error" className="text-sm text-destructive">
                    {errors.startTime.message}
                  </p>
                )}
              </div>
            </div>
          </div>

          <Separator />

          {/* End Date & Time */}
          <div className="space-y-4">
            <h4 className="font-medium">Sfârșit eveniment</h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="end-date" className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Data sfârșit
                </Label>
                <Input
                  id="end-date"
                  type="date"
                  {...register("endDate")}
                  aria-invalid={errors.endDate ? "true" : "false"}
                  aria-describedby={
                    errors.endDate ? "end-date-error" : undefined
                  }
                />
                {errors.endDate && (
                  <p id="end-date-error" className="text-sm text-destructive">
                    {errors.endDate.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="end-time" className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Ora sfârșit
                </Label>
                <Input
                  id="end-time"
                  type="time"
                  {...register("endTime")}
                  aria-invalid={errors.endTime ? "true" : "false"}
                  aria-describedby={
                    errors.endTime ? "end-time-error" : undefined
                  }
                />
                {errors.endTime && (
                  <p id="end-time-error" className="text-sm text-destructive">
                    {errors.endTime.message}
                  </p>
                )}
              </div>
            </div>

            <p className="text-xs text-muted-foreground">
              Opțional. Dacă nu știi ora exactă de sfârșit, poți lăsa aceste
              câmpuri goale.
            </p>
          </div>
        </div>
      )}

      <Separator />

      <div className="p-4 border rounded-lg bg-muted/20">
        <p className="text-sm text-muted-foreground">
          <strong>Sfat:</strong> Adaugă program complet pentru a ajuta
          participanții să își planifice timpul. Pentru evenimente pe mai multe
          zile, selectează data de început și data de sfârșit.
        </p>
      </div>
    </div>
  );
}
