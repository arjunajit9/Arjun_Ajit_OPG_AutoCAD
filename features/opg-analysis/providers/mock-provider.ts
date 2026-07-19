import { analysisResultSchema } from "../schemas";
import type { OPGAnalysisProvider } from "../provider";
import type { OPGAnalysisInput, OPGAnalysisResult } from "../types";
import { toothNumberForDisplaySide } from "../laterality";
import { CURRENT_MEASUREMENT_MODEL_VERSION } from "../result-normalization";

export class MockOPGAnalysisProvider implements OPGAnalysisProvider {
  async analyse(input: OPGAnalysisInput): Promise<OPGAnalysisResult> {
    await new Promise((resolve) => setTimeout(resolve, 900));
    const result: OPGAnalysisResult = {
      schemaVersion: "1.0",
      analysisId: input.analysisId,
      studyReference: input.studyReference,
      provider: "mock",
      modelName: "Examiner-Guided Winter Measurement",
      modelVersion: CURRENT_MEASUREMENT_MODEL_VERSION,
      analysisMode: "research",
      status: "completed",
      imageQuality: "limited",
      generatedAt: new Date().toISOString(),
      requiresSpecialistReview: true,
      findings: [
        {
          id: "finding-angulation-48",
          category: "mandibular_third_molar_angulation",
          title: "Tooth 48 — not measured",
          description:
            "Place the third-molar and adjacent second-molar long axes to calculate the angulation.",
          toothNumbers: [toothNumberForDisplaySide("left")],
          region:
            "Patient right posterior mandible (image left, near R marker)",
          severity: "not_assessed",
          reviewStatus: "unreviewed",
          annotationSource: "clinician",
          boundingBox: { x: 0.17, y: 0.49, width: 0.14, height: 0.26 },
          angulation: {
            toothNumber: toothNumberForDisplaySide("left"),
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
          id: "finding-angulation-38",
          category: "mandibular_third_molar_angulation",
          title: "Tooth 38 — not measured",
          description:
            "Place the third-molar and adjacent second-molar long axes to calculate the angulation.",
          toothNumbers: [toothNumberForDisplaySide("right")],
          region:
            "Patient left posterior mandible (image right, near L marker)",
          severity: "not_assessed",
          reviewStatus: "unreviewed",
          annotationSource: "clinician",
          boundingBox: { x: 0.69, y: 0.49, width: 0.14, height: 0.26 },
          angulation: {
            toothNumber: toothNumberForDisplaySide("right"),
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
