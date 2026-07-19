import { describe, expect, it } from "vitest";
import { buildDraftReport } from "@/features/opg-analysis/report-builder";
import type { OPGAnalysisResult } from "@/features/opg-analysis/types";

const result: OPGAnalysisResult = {
  schemaVersion: "1.0",
  analysisId: "a",
  provider: "mock",
  modelName: "Mock",
  modelVersion: "1",
  analysisMode: "mock",
  status: "completed",
  imageQuality: "limited",
  generatedAt: "2026-01-01T00:00:00.000Z",
  requiresSpecialistReview: true,
  findings: [
    {
      id: "accepted",
      category: "mandibular_third_molar_angulation",
      title: "Accepted title",
      description: "Accepted text",
      severity: "not_assessed",
      reviewStatus: "accepted",
      annotationSource: "clinician",
    },
    {
      id: "rejected",
      category: "mandibular_third_molar_angulation",
      title: "Rejected title",
      description: "Rejected text",
      severity: "not_assessed",
      reviewStatus: "rejected",
      annotationSource: "model",
    },
  ],
};

describe("draft report", () => {
  it("generates the final clinical report without presentation notes or limitations", () => {
    const report = buildDraftReport(
      result,
      "Reviewed by clinician.",
      "Final assessment recorded.",
    );
    expect(report).toContain("FINAL CLINICAL REPORT");
    expect(report).toContain("Clinician Comments");
    expect(report).toContain("Final Clinical Assessment");
    expect(report).toContain("Final assessment recorded.");
    expect(report).not.toContain("Presentation notes");
    expect(report).not.toContain("Limitations");
  });
});
