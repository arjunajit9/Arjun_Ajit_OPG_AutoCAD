import type { OPGAnalysisResult } from "./types";
import {
  THESIS_PRESENTER,
  THESIS_PRESENTER_ROLE,
  THESIS_TITLE,
  WINTER_THRESHOLD_SUMMARY,
} from "./thesis-copy";

export function buildDraftReport(
  result: OPGAnalysisResult,
  comments: string,
): string {
  const reviewed = result.findings.filter(
    (finding) =>
      finding.reviewStatus === "accepted" || finding.reviewStatus === "edited",
  );
  const lines = reviewed.length
    ? reviewed.map((finding) => `• ${finding.title}: ${finding.description}`)
    : [
        "• No examiner-measured observations have been confirmed for this summary.",
      ];
  return [
    "THESIS PRESENTATION OBSERVATION SUMMARY",
    `Thesis topic: ${THESIS_TITLE}`,
    `Presenter: ${THESIS_PRESENTER}, ${THESIS_PRESENTER_ROLE}`,
    `Anonymous study reference: ${result.studyReference || "Not provided"}`,
    `Generated: ${new Date(result.generatedAt).toLocaleString()}`,
    "",
    "Measured observations",
    ...lines,
    "",
    "Presentation notes",
    comments.trim() || "No presentation notes entered.",
    "",
    "Proposal-aligned Winter thresholds",
    WINTER_THRESHOLD_SUMMARY,
    "",
    "Limitations",
    ...result.limitations.map((limitation) => `• ${limitation}`),
    "",
    "Study outcome note",
    "Pericoronitis status must be recorded from the study's defined clinical examination criteria; it is not determined from this OPG review.",
    "",
    "For MDS thesis presentation demonstration only. Examiner verification is required; this tool does not make a diagnosis or treatment decision.",
  ].join("\n");
}
