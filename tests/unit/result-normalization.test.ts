import { describe, expect, it } from "vitest";
import { normalizeStoredStudyLaterality } from "@/features/opg-analysis/result-normalization";
import type { TemporaryStudy } from "@/features/opg-analysis/types";

describe("stored measurement laterality migration", () => {
  it("corrects legacy image-left records to Tooth 48 and preserves a signed Winter angle", () => {
    const study: TemporaryStudy = {
      id: "legacy-study",
      image: new Blob(["image"]),
      fileName: "opg.png",
      mediaType: "image/png",
      createdAt: "2026-01-01T00:00:00.000Z",
      expiresAt: "2026-01-02T00:00:00.000Z",
      comments: "",
      result: {
        schemaVersion: "1.0",
        analysisId: "legacy-study",
        provider: "mock",
        modelName: "Legacy",
        modelVersion: "proposal-thresholds-1.0.0",
        analysisMode: "research",
        status: "completed",
        imageQuality: "limited",
        generatedAt: "2026-01-01T00:00:00.000Z",
        requiresSpecialistReview: true,
        limitations: ["Legacy record"],
        findings: [
          {
            id: "finding-angulation-38",
            category: "mandibular_third_molar_angulation",
            title: "Tooth 38 — Winter result: distoangular",
            description: "Legacy measurement",
            toothNumbers: ["38"],
            severity: "not_assessed",
            reviewStatus: "edited",
            annotationSource: "clinician",
            boundingBox: { x: 0.17, y: 0.49, width: 0.14, height: 0.26 },
            angulation: {
              toothNumber: "38",
              classification: "distoangular",
              relativeAngleDegrees: 22.1,
              signedRotationDegrees: 22.1,
              referenceMethod: "Legacy",
              classificationMethod: "Legacy",
              specialistReviewRequired: true,
              studyEligibleClassification: true,
              pericoronitisOutcome: "not_assessed_from_opg",
              measurementSource: "clinician_geometry",
            },
          },
        ],
      },
    };

    const normalized = normalizeStoredStudyLaterality(study);
    const finding = normalized.result?.findings[0];
    expect(finding?.angulation?.toothNumber).toBe("48");
    expect(finding?.region).toContain("Patient right");
    expect(finding?.angulation?.signedRotationDegrees).toBe(-22.1);
    expect(finding?.angulation?.classification).toBe("distoangular");
  });
});
