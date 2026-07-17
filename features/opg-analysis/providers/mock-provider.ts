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
      modelName: "Third Molar Angulation Demonstration Ruleset",
      modelVersion: "thesis-mock-1.0.0",
      analysisMode: "mock",
      status: "completed",
      imageQuality: "limited",
      generatedAt: new Date().toISOString(),
      requiresSpecialistReview: true,
      limitations: [
        "Demonstration findings are not derived from the uploaded image pixels.",
        "The prototype is scoped only to FDI teeth 38 and 48 and cannot establish pericoronitis.",
        "Pericoronitis is a clinical outcome and is not determined from an OPG alone.",
        "Angulation measurements and annotations are simulated and require specialist verification.",
      ],
      findings: [
        {
          id: "finding-angulation-48",
          category: "mandibular_third_molar_angulation",
          title: "Tooth 48 — possible mesioangular impaction",
          description:
            "Demonstration exposure classification for the thesis cohort; specialist measurement confirmation is required.",
          toothNumbers: ["48"],
          region: "Lower-right posterior mandible",
          probability: 0.78,
          severity: "not_assessed",
          reviewStatus: "unreviewed",
          annotationSource: "model",
          boundingBox: { x: 0.69, y: 0.49, width: 0.14, height: 0.26 },
          angulation: {
            toothNumber: "48",
            classification: "mesioangular",
            toothLongAxisDegrees: 125.2,
            referenceAxisDegrees: 90,
            relativeAngleDegrees: 35.2,
            signedRotationDegrees: 35.2,
            referenceMethod: "Demonstration adjacent second-molar long axis",
            classificationMethod:
              "Simulated Winter classification; not image-derived; not clinically validated",
            modelEstimatedProbability: 0.78,
            measurementUncertaintyDegrees: 8,
            toothAxis: [
              { x: 0.78, y: 0.7 },
              { x: 0.72, y: 0.53 },
            ],
            referenceAxis: [
              { x: 0.65, y: 0.72 },
              { x: 0.65, y: 0.53 },
            ],
            specialistReviewRequired: true,
            studyEligibleClassification: true,
            pericoronitisOutcome: "not_assessed_from_opg",
            measurementSource: "mock",
          },
        },
        {
          id: "finding-angulation-38",
          category: "mandibular_third_molar_angulation",
          title: "Tooth 38 — possible distoangular impaction",
          description:
            "Demonstration exposure classification for the thesis cohort; specialist measurement confirmation is required.",
          toothNumbers: ["38"],
          region: "Lower-left third molar region",
          probability: 0.71,
          severity: "not_assessed",
          reviewStatus: "unreviewed",
          annotationSource: "model",
          boundingBox: { x: 0.17, y: 0.49, width: 0.14, height: 0.26 },
          angulation: {
            toothNumber: "38",
            classification: "distoangular",
            toothLongAxisDegrees: 125.2,
            referenceAxisDegrees: 90,
            relativeAngleDegrees: 35.2,
            signedRotationDegrees: 35.2,
            referenceMethod: "Demonstration adjacent second-molar long axis",
            classificationMethod:
              "Simulated Winter classification; not image-derived; not clinically validated",
            modelEstimatedProbability: 0.71,
            measurementUncertaintyDegrees: 8,
            toothAxis: [
              { x: 0.28, y: 0.7 },
              { x: 0.22, y: 0.53 },
            ],
            referenceAxis: [
              { x: 0.34, y: 0.72 },
              { x: 0.34, y: 0.53 },
            ],
            specialistReviewRequired: true,
            studyEligibleClassification: true,
            pericoronitisOutcome: "not_assessed_from_opg",
            measurementSource: "mock",
          },
        },
      ],
    };
    return analysisResultSchema.parse(result);
  }
}
