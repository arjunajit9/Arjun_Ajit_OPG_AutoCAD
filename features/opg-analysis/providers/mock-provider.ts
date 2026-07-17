import { analysisResultSchema } from "../schemas";
import type { OPGAnalysisProvider } from "../provider";
import type { OPGAnalysisInput, OPGAnalysisResult } from "../types";

export class MockOPGAnalysisProvider implements OPGAnalysisProvider {
  async analyse(input: OPGAnalysisInput): Promise<OPGAnalysisResult> {
    await new Promise((resolve) => setTimeout(resolve, 900));
    const result: OPGAnalysisResult = {
      schemaVersion: "1.0",
      analysisId: input.analysisId,
      studyReference: input.studyReference,
      provider: "mock",
      modelName: "Examiner-Guided Winter Measurement",
      modelVersion: "proposal-thresholds-1.0.0",
      analysisMode: "research",
      status: "completed",
      imageQuality: "limited",
      generatedAt: new Date().toISOString(),
      requiresSpecialistReview: true,
      limitations: [
        "No angulation result is produced until the examiner places all four axis points.",
        "The presentation tool is scoped to FDI teeth 38 and 48 and cannot establish pericoronitis.",
        "Pericoronitis is a clinical outcome and is not determined from an OPG alone.",
        "The examiner must verify landmark placement and the resulting Winter classification.",
      ],
      findings: [
        {
          id: "finding-angulation-38",
          category: "mandibular_third_molar_angulation",
          title: "Tooth 38 — not measured",
          description:
            "Place the third-molar and adjacent second-molar long axes to calculate the angulation.",
          toothNumbers: ["38"],
          region: "Lower-left posterior mandible",
          severity: "not_assessed",
          reviewStatus: "unreviewed",
          annotationSource: "clinician",
          boundingBox: { x: 0.17, y: 0.49, width: 0.14, height: 0.26 },
          angulation: {
            toothNumber: "38",
            classification: "unable_to_assess",
            referenceMethod:
              "Adjacent mandibular second-molar long axis (awaiting examiner points)",
            classificationMethod:
              "Not classified — awaiting examiner-positioned axes",
            specialistReviewRequired: true,
            studyEligibleClassification: false,
            pericoronitisOutcome: "not_assessed_from_opg",
            measurementSource: "unmeasured",
          },
        },
        {
          id: "finding-angulation-48",
          category: "mandibular_third_molar_angulation",
          title: "Tooth 48 — not measured",
          description:
            "Place the third-molar and adjacent second-molar long axes to calculate the angulation.",
          toothNumbers: ["48"],
          region: "Lower-right posterior mandible",
          severity: "not_assessed",
          reviewStatus: "unreviewed",
          annotationSource: "clinician",
          boundingBox: { x: 0.69, y: 0.49, width: 0.14, height: 0.26 },
          angulation: {
            toothNumber: "48",
            classification: "unable_to_assess",
            referenceMethod:
              "Adjacent mandibular second-molar long axis (awaiting examiner points)",
            classificationMethod:
              "Not classified — awaiting examiner-positioned axes",
            specialistReviewRequired: true,
            studyEligibleClassification: false,
            pericoronitisOutcome: "not_assessed_from_opg",
            measurementSource: "unmeasured",
          },
        },
      ],
    };
    return analysisResultSchema.parse(result);
  }
}
