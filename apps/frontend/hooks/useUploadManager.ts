import { useCallback, useMemo, useRef, useState } from "react";
import { uploadFile } from "@/lib/api/upload";
import type { Media } from "@/types/payload-types";
import * as Sentry from "@sentry/nextjs";

type UseUploadManagerOptions = {
  token?: string;
  accept?: string;
  maxSizeMB?: number;
};

type UploadAllOptions = {
  folder?: string;
  context?: "listing" | "avatar" | "event" | "document" | "verification";
};

export type UploadError = {
  message: string;
  type: "file_size" | "file_type" | "server" | "network" | "auth" | "unknown";
  file?: File;
};

function formatUploadError(error: unknown, file?: File): UploadError {
  if (error instanceof Error) {
    const message = error.message.toLowerCase();

    // File size errors
    if (
      message.includes("size") ||
      message.includes("too large") ||
      message.includes("exceed")
    ) {
      return {
        message: file
          ? `Fișierul "${file.name}" depășește limita de ${(file.size / (1024 * 1024)).toFixed(1)} MB. Dimensiunea maximă permisă este de 5 MB.`
          : "Fișierul depășește limita de 5 MB.",
        type: "file_size",
        file,
      };
    }

    // Authentication errors
    if (
      message.includes("token") ||
      message.includes("auth") ||
      message.includes("unauthorized") ||
      message.includes("401")
    ) {
      return {
        message: "Sesiunea a expirat. Te rugăm să te autentifici din nou.",
        type: "auth",
        file,
      };
    }

    // Network errors
    if (
      message.includes("network") ||
      message.includes("fetch") ||
      message.includes("failed to fetch")
    ) {
      return {
        message:
          "Eroare de conexiune. Verifică conexiunea la internet și încearcă din nou.",
        type: "network",
        file,
      };
    }

    // Server errors (4xx, 5xx)
    if (message.includes("400") || message.includes("bad request")) {
      return {
        message: "Formatul fișierului nu este suportat sau este invalid.",
        type: "file_type",
        file,
      };
    }

    if (message.includes("413") || message.includes("payload too large")) {
      return {
        message: file
          ? `Fișierul "${file.name}" este prea mare. Dimensiunea maximă permisă este de 5 MB.`
          : "Fișierul este prea mare. Dimensiunea maximă permisă este de 5 MB.",
        type: "file_size",
        file,
      };
    }

    if (message.includes("500") || message.includes("internal server error")) {
      return {
        message: "Eroare pe server. Te rugăm să încerci din nou mai târziu.",
        type: "server",
        file,
      };
    }

    // Try to parse JSON error response
    try {
      const parsed = JSON.parse(error.message);
      if (parsed.error || parsed.message) {
        return {
          message: parsed.message || parsed.error || "Eroare la încărcare.",
          type: "server",
          file,
        };
      }
    } catch {
      // Not JSON, continue with original message
    }

    // Default server error
    return {
      message:
        error.message ||
        "Eroare la încărcarea fișierului. Te rugăm să încerci din nou.",
      type: "server",
      file,
    };
  }

  return {
    message: "Eroare necunoscută la încărcare.",
    type: "unknown",
    file,
  };
}

export function useUploadManager(options: UseUploadManagerOptions = {}) {
  const { token, maxSizeMB = 5 } = options;
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [uploaded, setUploaded] = useState<Media[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<UploadError | null>(null);
  const [errors, setErrors] = useState<Map<string, UploadError>>(new Map());
  const objectUrlsRef = useRef<string[]>([]);

  const clearObjectURLs = () => {
    objectUrlsRef.current.forEach((url) => URL.revokeObjectURL(url));
    objectUrlsRef.current = [];
  };

  const clear = useCallback(() => {
    setFiles([]);
    setUploaded([]);
    setError(null);
    setErrors(new Map());
    setPreviews((prev) => {
      clearObjectURLs();
      return [];
    });
  }, []);

  const handleSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const list = e.target.files ? Array.from(e.target.files) : [];
      if (!list.length) return;

      // Clear previous errors
      setError(null);
      setErrors(new Map());

      // Basic validation
      const maxBytes = maxSizeMB * 1024 * 1024;
      const filtered: File[] = [];
      const newErrors = new Map<string, UploadError>();

      list.forEach((f) => {
        if (f.size > maxBytes) {
          newErrors.set(f.name, {
            message: `Fișierul "${f.name}" depășește limita de ${maxSizeMB} MB. Dimensiunea actuală: ${(f.size / (1024 * 1024)).toFixed(1)} MB.`,
            type: "file_size",
            file: f,
          });
        } else {
          filtered.push(f);
        }
      });

      if (newErrors.size > 0) {
        setErrors(newErrors);
        // Set first error as main error
        const firstError = Array.from(newErrors.values())[0];
        setError(firstError);
      }

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
      // Validate file size before upload
      const maxBytes = maxSizeMB * 1024 * 1024;
      if (file.size > maxBytes) {
        const uploadError: UploadError = {
          message: `Fișierul "${file.name}" depășește limita de ${maxSizeMB} MB. Dimensiunea actuală: ${(file.size / (1024 * 1024)).toFixed(1)} MB.`,
          type: "file_size",
          file,
        };
        setError(uploadError);
        setErrors(new Map([[file.name, uploadError]]));
        throw new Error(uploadError.message);
      }

      if (!token) {
        const uploadError: UploadError = {
          message: "Sesiunea a expirat. Te rugăm să te autentifici din nou.",
          type: "auth",
          file,
        };
        setError(uploadError);
        throw new Error(uploadError.message);
      }

      setIsUploading(true);
      setError(null);
      setErrors((prev) => {
        const next = new Map(prev);
        next.delete(file.name);
        return next;
      });

      try {
        const res = await uploadFile(file, token, folder, {
          context: context ?? "document",
          temp: true,
        });
        const mediaDoc = (
          res && typeof res === "object" && "doc" in res
            ? (res as any).doc
            : res
        ) as Media; // eslint-disable-line @typescript-eslint/no-explicit-any
        setUploaded((prev) => [...prev, mediaDoc]);
        return mediaDoc;
      } catch (error) {
        console.error("Error uploading file:", error);
        const uploadError = formatUploadError(error, file);

        // Report to Sentry for server errors (not user errors like file size)
        if (
          error instanceof Error &&
          uploadError.type !== "file_size" &&
          uploadError.type !== "file_type"
        ) {
          Sentry.withScope((scope) => {
            scope.setTag("error_type", "upload");
            scope.setTag("upload_error_type", uploadError.type);
            scope.setContext("upload", {
              fileName: file.name,
              fileSize: file.size,
              fileType: file.type,
              errorType: uploadError.type,
            });
            Sentry.captureException(error);
          });
        }

        setError(uploadError);
        setErrors((prev) => {
          const next = new Map(prev);
          next.set(file.name, uploadError);
          return next;
        });
        throw error;
      } finally {
        setIsUploading(false);
      }
    },
    [token, maxSizeMB],
  );

  const uploadAll = useCallback(
    async ({ folder, context }: UploadAllOptions = {}) => {
      if (!files.length) return [];

      // Validate all files before upload
      const maxBytes = maxSizeMB * 1024 * 1024;
      const newErrors = new Map<string, UploadError>();

      files.forEach((f) => {
        if (f.size > maxBytes) {
          newErrors.set(f.name, {
            message: `Fișierul "${f.name}" depășește limita de ${maxSizeMB} MB. Dimensiunea actuală: ${(f.size / (1024 * 1024)).toFixed(1)} MB.`,
            type: "file_size",
            file: f,
          });
        }
      });

      if (newErrors.size > 0) {
        setErrors(newErrors);
        const firstError = Array.from(newErrors.values())[0];
        setError(firstError);
        throw new Error(firstError.message);
      }

      if (!token) {
        const uploadError: UploadError = {
          message: "Sesiunea a expirat. Te rugăm să te autentifici din nou.",
          type: "auth",
        };
        setError(uploadError);
        throw new Error(uploadError.message);
      }

      setIsUploading(true);
      setError(null);
      setErrors(new Map());

      try {
        const resultsRaw = await Promise.all(
          files.map((f) =>
            uploadFile(f, token, folder, {
              context: context ?? "document",
              temp: true,
            }),
          ),
        );
        const results = (resultsRaw as any[]).map((r) =>
          r && typeof r === "object" && "doc" in r ? r.doc : r,
        ) as Media[]; // eslint-disable-line @typescript-eslint/no-explicit-any
        setUploaded(results);
        return results;
      } catch (error) {
        const uploadError = formatUploadError(error);
        setError(uploadError);
        throw error;
      } finally {
        setIsUploading(false);
      }
    },
    [files, token, maxSizeMB],
  );

  return useMemo(
    () => ({
      files,
      previews,
      uploaded,
      isUploading,
      error,
      errors,
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
      error,
      errors,
      handleSelect,
      uploadAll,
      uploadSingle,
      clear,
    ],
  );
}
