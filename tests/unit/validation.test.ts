import { describe, expect, it } from "vitest";
import { validateAnonymousReference, validateUploadFile } from "@/features/opg-analysis/validation";

describe("upload validation", () => {
  it("accepts matching JPEG and PNG files", () => {
    expect(validateUploadFile({ name: "study.jpg", type: "image/jpeg", size: 1024 }).valid).toBe(true);
    expect(validateUploadFile({ name: "study.png", type: "image/png", size: 1024 }).valid).toBe(true);
  });
  it("rejects DICOM and oversized images", () => {
    expect(validateUploadFile({ name: "study.dcm", type: "application/dicom", size: 1024 }).valid).toBe(false);
    expect(validateUploadFile({ name: "study.png", type: "image/png", size: 21 * 1024 * 1024 }, 20).valid).toBe(false);
  });
  it("rejects mismatched extensions", () => {
    expect(validateUploadFile({ name: "study.png", type: "image/jpeg", size: 1024 }).error).toContain("extension");
  });
  it("allows safe anonymous references but rejects punctuation commonly used in identifiers", () => {
    expect(validateAnonymousReference("STUDY-001").valid).toBe(true);
    expect(validateAnonymousReference("name@example.com").valid).toBe(false);
  });
});
