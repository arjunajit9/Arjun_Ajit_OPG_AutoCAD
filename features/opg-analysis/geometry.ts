import type { AngulationClassification, MeasurementPoint } from "./types";

export interface GeometryResult {
  toothAxis: [MeasurementPoint, MeasurementPoint];
  referenceAxis: [MeasurementPoint, MeasurementPoint];
  toothLongAxisDegrees: number;
  referenceAxisDegrees: number;
  relativeAngleDegrees: number;
  signedRotationDegrees: number;
}

function lineAngle(
  [start, end]: [MeasurementPoint, MeasurementPoint],
  aspectRatio: number,
): number {
  return (
    (Math.atan2(-(end.y - start.y), (end.x - start.x) * aspectRatio) * 180) /
    Math.PI
  );
}

function normalizeSignedAngle(value: number): number {
  let normalized = value % 360;
  if (normalized > 180) normalized -= 360;
  if (normalized <= -180) normalized += 360;
  return normalized;
}

function round(value: number): number {
  return Math.round(value * 10) / 10;
}

export function calculateGeometry(
  points: MeasurementPoint[],
  aspectRatio = 1,
): GeometryResult | undefined {
  if (points.length !== 4) return undefined;
  const toothAxis: [MeasurementPoint, MeasurementPoint] = [
    points[0],
    points[1],
  ];
  const referenceAxis: [MeasurementPoint, MeasurementPoint] = [
    points[2],
    points[3],
  ];
  const toothLongAxisDegrees = lineAngle(toothAxis, aspectRatio);
  const referenceAxisDegrees = lineAngle(referenceAxis, aspectRatio);
  const signedRotationDegrees = normalizeSignedAngle(
    toothLongAxisDegrees - referenceAxisDegrees,
  );
  const relativeAngleDegrees = Math.min(
    Math.abs(signedRotationDegrees),
    180 - Math.abs(signedRotationDegrees),
  );
  return {
    toothAxis,
    referenceAxis,
    toothLongAxisDegrees: round(toothLongAxisDegrees),
    referenceAxisDegrees: round(referenceAxisDegrees),
    relativeAngleDegrees: round(relativeAngleDegrees),
    signedRotationDegrees: round(signedRotationDegrees),
  };
}

export function lineIntersection(
  first: [MeasurementPoint, MeasurementPoint],
  second: [MeasurementPoint, MeasurementPoint],
): MeasurementPoint | undefined {
  const [a, b] = first;
  const [c, d] = second;
  const denominator = (b.x - a.x) * (d.y - c.y) - (b.y - a.y) * (d.x - c.x);
  if (Math.abs(denominator) < 1e-8) return undefined;
  const numerator = (c.x - a.x) * (d.y - c.y) - (c.y - a.y) * (d.x - c.x);
  const t = numerator / denominator;
  return { x: a.x + t * (b.x - a.x), y: a.y + t * (b.y - a.y) };
}

export function extendLine(
  [start, end]: [MeasurementPoint, MeasurementPoint],
  distance = 3,
): [MeasurementPoint, MeasurementPoint] {
  const dx = end.x - start.x;
  const dy = end.y - start.y;
  const length = Math.hypot(dx, dy) || 1;
  const unitX = dx / length;
  const unitY = dy / length;
  return [
    { x: start.x - unitX * distance, y: start.y - unitY * distance },
    { x: end.x + unitX * distance, y: end.y + unitY * distance },
  ];
}

export function winterAngulationClassification(
  toothNumber: string,
  signedRotationDegrees: number,
): AngulationClassification {
  if (
    !Number.isFinite(signedRotationDegrees) ||
    !["38", "48"].includes(toothNumber)
  )
    return "unable_to_assess";

  const normalizedRotation = normalizeSignedAngle(signedRotationDegrees);
  const magnitude = Math.abs(normalizedRotation);

  // Treat the published integer ranges as continuous boundaries so decimal
  // measurements do not fall into gaps between categories.
  if (magnitude <= 10) return "vertical";
  if (magnitude >= 80 && magnitude <= 100) return "horizontal";
  if (magnitude > 100) return "other";

  const mesialRotation =
    toothNumber === "38" ? normalizedRotation < 0 : normalizedRotation > 0;
  return mesialRotation ? "mesioangular" : "distoangular";
}
