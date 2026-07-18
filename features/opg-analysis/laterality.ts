export type MandibularThirdMolarToothNumber = "38" | "48";
export type PatientSide = "left" | "right";
export type DisplaySide = "left" | "right";

export function isMandibularThirdMolarToothNumber(
  value: string | undefined,
): value is MandibularThirdMolarToothNumber {
  return value === "38" || value === "48";
}

export function patientSideForTooth(
  toothNumber: MandibularThirdMolarToothNumber,
): PatientSide {
  return toothNumber === "38" ? "left" : "right";
}

export function toothNumberForPatientSide(
  patientSide: PatientSide,
): MandibularThirdMolarToothNumber {
  return patientSide === "left" ? "38" : "48";
}

export function patientSideForDisplaySide(
  displaySide: DisplaySide,
  horizontallyFlipped = false,
): PatientSide {
  if (horizontallyFlipped) return displaySide;
  return displaySide === "left" ? "right" : "left";
}

export function toothNumberForDisplaySide(
  displaySide: DisplaySide,
  horizontallyFlipped = false,
): MandibularThirdMolarToothNumber {
  return toothNumberForPatientSide(
    patientSideForDisplaySide(displaySide, horizontallyFlipped),
  );
}

export function displaySideForTooth(
  toothNumber: MandibularThirdMolarToothNumber,
  horizontallyFlipped = false,
): DisplaySide {
  const patientSide = patientSideForTooth(toothNumber);
  if (horizontallyFlipped) return patientSide;
  return patientSide === "left" ? "right" : "left";
}

export function toothNumberForNormalizedImageX(
  normalizedX: number,
  horizontallyFlipped = false,
): MandibularThirdMolarToothNumber {
  return toothNumberForDisplaySide(
    normalizedX < 0.5 ? "left" : "right",
    horizontallyFlipped,
  );
}

export function screenRotationToSignedWinterAngle(
  toothNumber: MandibularThirdMolarToothNumber,
  screenRotationDegrees: number,
  horizontallyFlipped = false,
): number {
  const sideMultiplier = toothNumber === "38" ? 1 : -1;
  const flipMultiplier = horizontallyFlipped ? -1 : 1;
  return screenRotationDegrees * sideMultiplier * flipMultiplier;
}

export function signedWinterAngleToScreenRotation(
  toothNumber: MandibularThirdMolarToothNumber,
  signedWinterAngleDegrees: number,
  horizontallyFlipped = false,
): number {
  return screenRotationToSignedWinterAngle(
    toothNumber,
    signedWinterAngleDegrees,
    horizontallyFlipped,
  );
}
