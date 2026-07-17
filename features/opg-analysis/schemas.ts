import { z } from "zod";
import { findingCategories } from "./types";

const unitCoordinate = z.number().min(0).max(1);
const pointSchema = z.object({ x: unitCoordinate, y: unitCoordinate });
const axisSchema = z.tuple([pointSchema, pointSchema]);

const angulationSchema = z.object({
  toothNumber: z.string().min(1),
  classification: z.enum([
    "mesioangular",
    "distoangular",
    "vertical",
    "horizontal",
    "other",
    "unable_to_assess",
  ]),
  toothLongAxisDegrees: z.number().min(-180).max(180).optional(),
  referenceAxisDegrees: z.number().min(-180).max(180).optional(),
  relativeAngleDegrees: z.number().min(0).max(180).optional(),
  referenceMethod: z.string().min(1),
  classificationMethod: z.string().min(1),
  modelEstimatedProbability: z.number().min(0).max(1).optional(),
  measurementUncertaintyDegrees: z.number().nonnegative().optional(),
  toothAxis: axisSchema.optional(),
  referenceAxis: axisSchema.optional(),
  specialistReviewRequired: z.literal(true),
  studyEligibleClassification: z.boolean(),
  pericoronitisOutcome: z.literal("not_assessed_from_opg"),
  measurementSource: z.enum(["mock", "clinician_geometry", "unmeasured"]),
  signedRotationDegrees: z.number().min(-180).max(180).optional(),
});

export const findingSchema = z.object({
  id: z.string().min(1),
  category: z.enum(findingCategories),
  title: z.string().min(1),
  description: z.string().min(1),
  toothNumbers: z.array(z.string()).optional(),
  region: z.string().optional(),
  probability: z.number().min(0).max(1).optional(),
  severity: z.enum(["low", "moderate", "high", "not_assessed"]),
  reviewStatus: z.enum(["unreviewed", "accepted", "rejected", "edited"]),
  boundingBox: z
    .object({
      x: unitCoordinate,
      y: unitCoordinate,
      width: unitCoordinate,
      height: unitCoordinate,
    })
    .refine(
      (box) => box.x + box.width <= 1 && box.y + box.height <= 1,
      "Box must fit image",
    )
    .optional(),
  annotationSource: z.enum(["model", "clinician"]),
  originalDescription: z.string().optional(),
  angulation: angulationSchema.optional(),
});

export const analysisResultSchema = z.object({
  schemaVersion: z.literal("1.0"),
  analysisId: z.string().min(1),
  studyReference: z.string().max(80).optional(),
  provider: z.enum(["mock", "remote"]),
  modelName: z.string().min(1),
  modelVersion: z.string().min(1),
  analysisMode: z.enum(["mock", "research", "validated"]),
  status: z.enum(["completed", "unable_to_analyse"]),
  imageQuality: z.enum(["adequate", "limited", "unusable"]),
  findings: z.array(findingSchema),
  limitations: z.array(z.string().min(1)).min(1),
  generatedAt: z.string().datetime(),
  requiresSpecialistReview: z.literal(true),
});

export const anonymousReferenceSchema = z
  .string()
  .trim()
  .max(80, "Use 80 characters or fewer")
  .regex(
    /^[a-zA-Z0-9._ -]*$/,
    "Use only letters, numbers, spaces, dots, hyphens or underscores",
  );
