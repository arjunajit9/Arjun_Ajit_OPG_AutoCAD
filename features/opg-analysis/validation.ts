import { anonymousReferenceSchema } from "./schemas";

export const SUPPORTED_TYPES = ["image/jpeg", "image/png"] as const;
export const DEFAULT_MAX_UPLOAD_MB = 20;

export interface FileValidationResult {
  valid: boolean;
  error?: string;
}

export function validateUploadFile(file: Pick<File, "type" | "size" | "name">, maxMb = DEFAULT_MAX_UPLOAD_MB): FileValidationResult {
  if (!SUPPORTED_TYPES.includes(file.type as (typeof SUPPORTED_TYPES)[number])) {
    return { valid: false, error: "Choose a JPEG or PNG image. DICOM is not supported in this prototype." };
  }
  if (file.size <= 0) return { valid: false, error: "The selected file is empty." };
  if (file.size > maxMb * 1024 * 1024) return { valid: false, error: `The image must be ${maxMb} MB or smaller.` };
  const extension = file.name.split(".").pop()?.toLowerCase();
  const expected = file.type === "image/png" ? ["png"] : ["jpg", "jpeg"];
  if (!extension || !expected.includes(extension)) {
    return { valid: false, error: "The file extension does not match its image type." };
  }
  return { valid: true };
}

export function validateAnonymousReference(value: string): FileValidationResult {
  const result = anonymousReferenceSchema.safeParse(value);
  return result.success ? { valid: true } : { valid: false, error: result.error.issues[0]?.message };
}
