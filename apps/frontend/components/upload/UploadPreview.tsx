import React from "react";

type Props = {
  previews: string[];
  onRemove?: (index: number) => void;
};

export function UploadPreview({ previews, onRemove }: Props) {
  if (!previews?.length) return null;
  return (
    <div className="space-y-2">
      {previews.map((src, index) => (
        <div
          key={index}
          className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg"
        >
          <div className="h-10 w-10 rounded overflow-hidden bg-muted flex items-center justify-center">
            {/* image preview if possible */}
            <img src={src} alt="" className="h-10 w-10 object-cover" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">Fișier {index + 1}</p>
          </div>
          {onRemove && (
            <button
              type="button"
              onClick={() => onRemove(index)}
              className="text-sm px-2 py-1 rounded border hover:bg-background"
            >
              Elimină
            </button>
          )}
        </div>
      ))}
    </div>
  );
}
