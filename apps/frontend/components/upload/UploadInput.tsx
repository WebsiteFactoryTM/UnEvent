import React from "react";

type Props = {
  multiple?: boolean;
  accept?: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  children?: React.ReactNode;
};

export function UploadInput({ multiple, accept, onChange, children }: Props) {
  return (
    <label className="flex flex-col items-center gap-3 cursor-pointer">
      {children ?? (
        <>
          <div className="text-center space-y-1">
            <p className="text-sm font-medium">
              Click pentru a selecta fișiere
            </p>
          </div>
        </>
      )}
      <input
        type="file"
        multiple={multiple}
        accept={accept}
        onChange={onChange}
        className="hidden"
      />
    </label>
  );
}
