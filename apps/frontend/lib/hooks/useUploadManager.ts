import { useCallback, useMemo, useRef, useState } from "react";
import { uploadFile } from "@/lib/api/upload";
import type { Media } from "@/types/payload-types";

type UseUploadManagerOptions = {
  token?: string;
  accept?: string;
  maxSizeMB?: number;
};

type UploadAllOptions = {
  folder?: string;
  context?: "listing" | "avatar" | "event" | "document" | "verification";
};

export function useUploadManager(options: UseUploadManagerOptions = {}) {
  const { token, maxSizeMB = 5 } = options;
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [uploaded, setUploaded] = useState<Media[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const objectUrlsRef = useRef<string[]>([]);

  const clearObjectURLs = () => {
    objectUrlsRef.current.forEach((url) => URL.revokeObjectURL(url));
    objectUrlsRef.current = [];
  };

  const clear = useCallback(() => {
    setFiles([]);
    setUploaded([]);
    setPreviews((prev) => {
      clearObjectURLs();
      return [];
    });
  }, []);

  const handleSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const list = e.target.files ? Array.from(e.target.files) : [];
      if (!list.length) return;
      // Basic validation
      const maxBytes = maxSizeMB * 1024 * 1024;
      const filtered = list.filter((f) => f.size <= maxBytes);
      const urls = filtered.map((f) => {
        const url = URL.createObjectURL(f);
        objectUrlsRef.current.push(url);
        return url;
      });
      setFiles(filtered);
      setPreviews(urls);
    },
    [maxSizeMB],
  );

  const uploadSingle = useCallback(
    async (
      file: File,
      context?: UploadAllOptions["context"],
      folder?: string,
    ) => {
      setIsUploading(true);
      try {
        const doc: Media = await uploadFile(file, token, folder, {
          context: context ?? "document",
          temp: true,
        });
        setUploaded((prev) => [...prev, doc]);
        return doc;
      } finally {
        setIsUploading(false);
      }
    },
    [token],
  );

  const uploadAll = useCallback(
    async ({ folder, context }: UploadAllOptions = {}) => {
      if (!files.length) return [];
      setIsUploading(true);
      try {
        const results = await Promise.all(
          files.map((f) =>
            uploadFile(f, token, folder, {
              context: context ?? "document",
              temp: true,
            }),
          ),
        );
        setUploaded(results as Media[]);
        return results as Media[];
      } finally {
        setIsUploading(false);
      }
    },
    [files, token],
  );

  return useMemo(
    () => ({
      files,
      previews,
      uploaded,
      isUploading,
      handleSelect,
      uploadAll,
      uploadSingle,
      clear,
    }),
    [
      files,
      previews,
      uploaded,
      isUploading,
      handleSelect,
      uploadAll,
      uploadSingle,
      clear,
    ],
  );
}
