export function ListingDescription({ description }: { description: string }) {
  return (
    <div className="glass-card p-4 md:p-6 space-y-4">
      <h2 className="text-2xl font-bold">Descriere</h2>
      <div className="prose prose-invert max-w-none">
        {description.split("\n\n").map((paragraph: string, index: number) => (
          <p key={index} className="text-muted-foreground leading-relaxed">
            {paragraph}
          </p>
        ))}
      </div>
    </div>
  );
}
