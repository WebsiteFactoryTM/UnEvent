import { FaCheck } from "react-icons/fa6";
import type { Service } from "@/types/payload-types";

interface ServiceOfferTagsProps {
  service: Service;
}

export function ServiceOfferTags({ service }: ServiceOfferTagsProps) {
  const features = service.features || [];

  if (features.length === 0) return null;

  return (
    <div className="glass-card p-6 md:p-8 space-y-4">
      <h2 className="text-2xl font-bold">Servicii oferite</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {features.map((feature) => (
          <div key={feature.id} className=" p-4 space-y-2">
            <div className="flex items-start gap-3">
              <div className="shrink-0 w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center mt-0.5">
                <FaCheck className="w-3 h-3 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold">{feature.feature}</h3>
                {feature.description && (
                  <p className="text-sm text-muted-foreground mt-1">
                    {feature.description}
                  </p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
