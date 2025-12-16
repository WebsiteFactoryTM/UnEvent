import { ExpandableText } from "@/components/ui/expandable-text";

export function ListingDescription({ description }: { description: string }) {
  return (
    <div className="glass-card p-4 md:p-6 space-y-4">
      <h2 className="text-2xl font-bold">Descriere</h2>
      <div className="prose prose-invert max-w-none">
        {description.split("\n\n").map((paragraph: string, index: number) => (
          <ExpandableText
            key={index}
            text={paragraph}
            maxWords={100}
            showMoreText="Arată mai mult"
            showLessText="Arată mai puțin"
          />
        ))}
      </div>
    </div>
  );
}
