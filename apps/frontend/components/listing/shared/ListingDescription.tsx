import { RichTextRenderer } from "@/components/editor/RichTextRenderer";
import { ExpandableText } from "@/components/ui/expandable-text";

export function ListingDescription({
  description,
  descriptionRich,
}: {
  description: string;
  descriptionRich: any;
}) {
  return (
    <div className="glass-card p-4 md:p-6 space-y-4">
      <h2 className="text-2xl font-bold">Descriere</h2>
      <div className="prose prose-invert max-w-none">
        <RichTextRenderer content={descriptionRich} fallback={description} />
      </div>
    </div>
  );
}
