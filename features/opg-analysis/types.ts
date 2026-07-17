export const findingCategories = ["mandibular_third_molar_angulation"] as const;

export type FindingCategory = (typeof findingCategories)[number];
export type FindingReviewStatus =
  "unreviewed" | "accepted" | "rejected" | "edited";
export type AngulationClassification =
  | "mesioangular"
  | "distoangular"
  | "vertical"
  | "horizontal"
  | "other"
  | "unable_to_assess";

export interface NormalizedBoundingBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface MeasurementPoint {
  x: number;
  y: number;
}

export interface AngulationAssessment {
  toothNumber: string;
  classification: AngulationClassification;
  toothLongAxisDegrees?: number;
  referenceAxisDegrees?: number;
  relativeAngleDegrees?: number;
  referenceMethod: string;
  classificationMethod: string;
  modelEstimatedProbability?: number;
  measurementUncertaintyDegrees?: number;
  toothAxis?: [MeasurementPoint, MeasurementPoint];
  referenceAxis?: [MeasurementPoint, MeasurementPoint];
  specialistReviewRequired: true;
  studyEligibleClassification: boolean;
  pericoronitisOutcome: "not_assessed_from_opg";
  measurementSource: "mock" | "clinician_geometry" | "unmeasured";
  signedRotationDegrees?: number;
}

export interface OPGFinding {
  id: string;
  category: FindingCategory;
  title: string;
  description: string;
  toothNumbers?: string[];
  region?: string;
  probability?: number;
  severity: "low" | "moderate" | "high" | "not_assessed";
  reviewStatus: FindingReviewStatus;
  boundingBox?: NormalizedBoundingBox;
  annotationSource: "model" | "clinician";
  originalDescription?: string;
  angulation?: AngulationAssessment;
}

export interface OPGAnalysisInput {
  analysisId: string;
  fileName: string;
  mediaType: "image/jpeg" | "image/png";
  fileSize: number;
  studyReference?: string;
}

export interface OPGAnalysisResult {
  schemaVersion: "1.0";
  analysisId: string;
  studyReference?: string;
  provider: "mock" | "remote";
  modelName: string;
  modelVersion: string;
  analysisMode: "mock" | "research" | "validated";
  status: "completed" | "unable_to_analyse";
  imageQuality: "adequate" | "limited" | "unusable";
  findings: OPGFinding[];
  limitations: string[];
  generatedAt: string;
  requiresSpecialistReview: true;
}

export interface TemporaryStudy {
  id: string;
  image: Blob;
  fileName: string;
  mediaType: "image/jpeg" | "image/png";
  studyReference?: string;
  createdAt: string;
  expiresAt: string;
  result?: OPGAnalysisResult;
  comments: string;
  reportDraft?: string;
}
