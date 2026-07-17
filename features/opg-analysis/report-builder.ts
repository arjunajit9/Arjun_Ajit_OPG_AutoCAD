import type { OPGAnalysisResult } from "./types";

export function buildDraftReport(result: OPGAnalysisResult, comments: string): string {
  const reviewed = result.findings.filter((finding) => finding.reviewStatus === "accepted" || finding.reviewStatus === "edited");
  const lines = reviewed.length
    ? reviewed.map((finding) => `• ${finding.title}: ${finding.description}`)
    : ["• No observations have been accepted for inclusion. This does not indicate a normal examination."];
  return [
    "DRAFT — SPECIALIST REVIEW REQUIRED",
    `Anonymous study reference: ${result.studyReference || "Not provided"}`,
    `Generated: ${new Date(result.generatedAt).toLocaleString()}`,
    `Image quality: ${result.imageQuality}`,
    "",
    "Reviewed observations",
    ...lines,
    "",
    "Clinician comments",
    comments.trim() || "No comments entered.",
    "",
    "Limitations",
    ...result.limitations.map((limitation) => `• ${limitation}`),
    "",
    "Study outcome note",
    "Pericoronitis status must be recorded from the study's defined clinical examination criteria; it is not determined from this OPG review.",
    "",
    "Research prototype — not for autonomous diagnosis or treatment decisions. This draft requires review and approval by a qualified dental or maxillofacial professional.",
  ].join("\n");
}
