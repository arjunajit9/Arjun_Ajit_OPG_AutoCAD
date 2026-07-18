import { winterAngulationClassification } from "./geometry";
import {
  screenRotationToSignedWinterAngle,
  toothNumberForNormalizedImageX,
} from "./laterality";
import type { TemporaryStudy } from "./types";

export const CURRENT_MEASUREMENT_MODEL_VERSION =
  "patient-laterality-signed-angle-2.0.0";

export function normalizeStoredStudyLaterality(
  study: TemporaryStudy,
): TemporaryStudy {
  if (
    !study.result ||
    study.result.modelVersion === CURRENT_MEASUREMENT_MODEL_VERSION
  ) {
    return study;
  }

  const findings = study.result.findings.map((finding) => {
    if (!finding.angulation || !finding.boundingBox) return finding;
    const imageCenterX = finding.boundingBox.x + finding.boundingBox.width / 2;
    const toothNumber = toothNumberForNormalizedImageX(imageCenterX);
    const previousScreenRotation = finding.angulation.signedRotationDegrees;
    const signedRotationDegrees =
      previousScreenRotation === undefined
        ? undefined
        : Math.round(
            screenRotationToSignedWinterAngle(
              toothNumber,
              previousScreenRotation,
            ) * 10,
          ) / 10;
    const classification =
      signedRotationDegrees === undefined
        ? "unable_to_assess"
        : winterAngulationClassification(toothNumber, signedRotationDegrees);
    const patientSide = toothNumber === "48" ? "right" : "left";
    const imageSide = toothNumber === "48" ? "left" : "right";
    const marker = toothNumber === "48" ? "R" : "L";

    return {
      ...finding,
      id: `finding-angulation-${toothNumber}`,
      title: finding.title.replace(/Tooth (38|48)/, `Tooth ${toothNumber}`),
      toothNumbers: [toothNumber],
      region: `Patient ${patientSide} posterior mandible (image ${imageSide}, near ${marker} marker)`,
      angulation: {
        ...finding.angulation,
        toothNumber,
        signedRotationDegrees,
        classification,
      },
    };
  });

  return {
    ...study,
    result: {
      ...study.result,
      modelVersion: CURRENT_MEASUREMENT_MODEL_VERSION,
      findings,
    },
  };
}
