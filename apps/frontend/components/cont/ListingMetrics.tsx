"use client";

import { FaEye, FaHeart, FaChartLine } from "react-icons/fa6";
import { Skeleton } from "../ui/skeleton";
import { useListingMetrics } from "@/lib/react-query/metrics.queries";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../ui/tooltip";

type ListingMetricsProps = {
  listingId: number;
  kind: "locations" | "events" | "services";
};

export function ListingMetrics({ listingId, kind }: ListingMetricsProps) {
  const { data: metrics, isLoading } = useListingMetrics(listingId, kind);

  if (isLoading) {
    return (
      <div className="flex items-center gap-4">
        <Skeleton className="h-4 w-16" />
        <Skeleton className="h-4 w-16" />
        <Skeleton className="h-4 w-16" />
      </div>
    );
  }

  if (!metrics) {
    return (
      <div className="flex items-center gap-4 text-sm text-muted-foreground">
        <span>—</span>
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div className="flex items-center gap-4 text-sm">
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="flex items-center gap-1.5 cursor-help">
              <FaEye className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="font-medium text-foreground">
                {metrics.views.toLocaleString("ro-RO")}
              </span>
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <p>Vizualizări totale</p>
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <div className="flex items-center gap-1.5 cursor-help">
              <FaHeart className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="font-medium text-foreground">
                {metrics.favorites.toLocaleString("ro-RO")}
              </span>
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <p>Favorite totale</p>
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <div className="flex items-center gap-1.5 cursor-help">
              <FaChartLine className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="font-medium text-foreground">
                {metrics.impressions.toLocaleString("ro-RO")}
              </span>
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <p>Impresii totale (apariții în feed-uri)</p>
          </TooltipContent>
        </Tooltip>
      </div>
    </TooltipProvider>
  );
}
