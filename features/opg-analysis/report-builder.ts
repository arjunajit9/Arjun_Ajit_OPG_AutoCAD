import type { OPGAnalysisResult, OPGFinding } from "./types";

export const CLINICAL_REPORT_FOOTER =
  "Research prototype. AI-assisted observations require confirmation by a qualified dental or oral and maxillofacial surgeon.";

function confirmedFindingText(finding: OPGFinding): string {
  if (finding.reviewStatus === "accepted") return finding.description;
  if (finding.reviewStatus === "rejected") return "Rejected - repeat required.";
  return "Not yet confirmed by the clinician.";
}

function aiFindingText(finding: OPGFinding): string {
  if (finding.annotationSource === "model") {
    return finding.originalDescription || finding.description;
  }
  return "No AI finding generated in Phase 1.";
}

export function buildDraftReport(
  result: OPGAnalysisResult,
  clinicianComments: string,
  finalClinicalAssessment: string,
): string {
  const findings = result.findings.filter((finding) => finding.angulation);
  const toothNumbers = findings
    .map((finding) => finding.angulation?.toothNumber)
    .filter((value): value is string => Boolean(value));

  const analysisLines = findings.length
    ? findings.flatMap((finding) => {
        const angle = finding.angulation!;
        return [
          `Tooth ${angle.toothNumber}`,
          `Winter's Classification: ${angle.classification.replaceAll("_", " ")}`,
          `Measured Angle: ${angle.signedRotationDegrees ?? "Not available"} deg`,
          `AI Findings: ${aiFindingText(finding)}`,
          `Clinician Confirmed Findings: ${confirmedFindingText(finding)}`,
        ];
      })
    : ["No OPG findings are available."];

  const measurementLines = findings.length
    ? findings.flatMap((finding) => {
        const angle = finding.angulation!;
        return [
          `Tooth ${angle.toothNumber}`,
          `CAD Measurements: ${angle.measurementSource === "clinician_geometry" ? "Four examiner-positioned landmarks with aspect-ratio-corrected 2D coordinate geometry" : "Not completed"}`,
          `Angle Measurements: Winter angle ${angle.signedRotationDegrees ?? "Not available"} deg`,
          `Tooth Axis Information: third-molar axis ${angle.toothLongAxisDegrees ?? "Not available"} deg; adjacent second-molar axis ${angle.referenceAxisDegrees ?? "Not available"} deg`,
        ];
      })
    : ["No measurements are available."];

  return [
    "FINAL CLINICAL REPORT",
    "",
    "Patient / Study Information",
    ...(result.studyReference
      ? [`Anonymous Study ID: ${result.studyReference}`]
      : []),
    `Date: ${new Date(result.generatedAt).toLocaleString()}`,
    `Tooth Number: ${toothNumbers.join(", ") || "Not available"}`,
    "",
    "OPG Analysis",
    ...analysisLines,
    "",
    "Measurements",
    ...measurementLines,
    "",
    "Clinician Comments",
    clinicianComments.trim() || "No clinician comments entered.",
    "",
    "Final Clinical Assessment",
    finalClinicalAssessment.trim() || "No final clinical assessment entered.",
    "",
    CLINICAL_REPORT_FOOTER,
  ].join("\n");
}
