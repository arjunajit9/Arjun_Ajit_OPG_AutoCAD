"use client";

import Image from "next/image";
import { Download, Printer, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { OPGFinding, TemporaryStudy } from "@/features/opg-analysis/types";
import {
  THESIS_DEPARTMENT,
  THESIS_INSTITUTION,
  THESIS_PRESENTER,
  THESIS_PRESENTER_ROLE,
  THESIS_TITLE,
  WINTER_THRESHOLD_SUMMARY,
} from "@/features/opg-analysis/thesis-copy";

interface StudyPrintPreviewProps {
  study: TemporaryStudy;
  annotatedImageUrl: string;
  downloading: boolean;
  onClose: () => void;
  onDownload: () => void;
}

function measuredFinding(findings: OPGFinding[], toothNumber: string) {
  return findings.find(
    (finding) =>
      finding.angulation?.toothNumber === toothNumber &&
      finding.angulation.measurementSource === "clinician_geometry",
  );
}

function examinerStatus(finding: OPGFinding | undefined): string {
  if (!finding) return "Awaiting measurement";
  if (finding.reviewStatus === "accepted") return "Confirmed";
  if (finding.reviewStatus === "rejected") return "Repeat required";
  if (finding.reviewStatus === "edited") return "Measured - confirm";
  return "Awaiting confirmation";
}

export function StudyPrintPreview({
  study,
  annotatedImageUrl,
  downloading,
  onClose,
  onDownload,
}: StudyPrintPreviewProps) {
  const result = study.result!;
  const bilateral = ["38", "48"].map((toothNumber) => ({
    toothNumber,
    finding: measuredFinding(result.findings, toothNumber),
  }));

  return (
    <div className="print-preview-backdrop" role="presentation">
      <section
        className="print-preview-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="print-preview-title"
      >
        <div className="print-preview-toolbar">
          <div>
            <strong>Print preview</strong>
            <span>A4 landscape · two-page thesis results PDF</span>
          </div>
          <div>
            <Button variant="secondary" onClick={() => window.print()}>
              <Printer size={16} /> Print
            </Button>
            <Button onClick={onDownload} disabled={downloading}>
              <Download size={16} />
              {downloading ? "Preparing PDF…" : "Download PDF"}
            </Button>
            <Button
              variant="ghost"
              onClick={onClose}
              aria-label="Close print preview"
            >
              <X size={17} />
            </Button>
          </div>
        </div>

        <article className="print-preview-sheet">
          <header className="print-report-header">
            <div>
              <span>MDS thesis presentation document</span>
              <h1 id="print-preview-title">
                Mandibular Third Molar Angulation Results
              </h1>
              <p>{THESIS_TITLE}</p>
            </div>
            <div className="print-report-meta">
              <strong>{THESIS_PRESENTER}</strong>
              <span>{THESIS_PRESENTER_ROLE}</span>
              <strong>Study: {study.studyReference || "Anonymous"}</strong>
              <span>
                Generated: {new Date(result.generatedAt).toLocaleString()}
              </span>
              <span>OPG suitability: examiner check required</span>
            </div>
          </header>

          <section className="print-image-section">
            <Image
              src={annotatedImageUrl}
              alt="Annotated panoramic radiograph with bilateral axes and angles"
              width={1600}
              height={800}
              unoptimized
            />
            <div className="print-image-legend">
              <span>
                <i className="print-legend-tooth" /> Third-molar long axis
              </span>
              <span>
                <i className="print-legend-reference" /> Adjacent second-molar
                long axis
              </span>
            </div>
          </section>

          <section
            className="print-bilateral-results"
            aria-label="Bilateral results"
          >
            {bilateral.map(({ toothNumber, finding }) => {
              const angle = finding?.angulation;
              return (
                <article className="print-result-card" key={toothNumber}>
                  <span>
                    Tooth {toothNumber} -{" "}
                    {toothNumber === "38" ? "Left" : "Right"}
                  </span>
                  <strong>
                    {angle
                      ? `${angle.classification.replaceAll("_", " ")} | ${angle.signedRotationDegrees}°`
                      : "Not measured"}
                  </strong>
                  <small>
                    {angle?.studyEligibleClassification
                      ? "Position category recorded for study"
                      : "Measurement incomplete"}
                  </small>
                </article>
              );
            })}
          </section>

          <section className="print-detail-section">
            <h2>Measurement Details</h2>
            <p className="print-detail-author">
              {THESIS_PRESENTER} | {THESIS_DEPARTMENT} | {THESIS_INSTITUTION}
            </p>
            <table>
              <thead>
                <tr>
                  <th>Tooth</th>
                  <th>Winter&apos;s Classification</th>
                  <th>Acute relative angle</th>
                  <th>Third-molar axis</th>
                  <th>Second-molar axis</th>
                  <th>Signed rotation</th>
                  <th>Study category</th>
                  <th>Examiner status</th>
                </tr>
              </thead>
              <tbody>
                {bilateral.map(({ toothNumber, finding }) => {
                  const angle = finding?.angulation;
                  return (
                    <tr key={`detail-${toothNumber}`}>
                      <th>
                        {toothNumber} -{" "}
                        {toothNumber === "38" ? "Left" : "Right"}
                      </th>
                      <td>
                        {angle?.classification.replaceAll("_", " ") || "—"}
                      </td>
                      <td>{angle?.relativeAngleDegrees ?? "—"}°</td>
                      <td>{angle?.toothLongAxisDegrees ?? "—"}°</td>
                      <td>{angle?.referenceAxisDegrees ?? "—"}°</td>
                      <td>{angle?.signedRotationDegrees ?? "—"}°</td>
                      <td>
                        {angle?.studyEligibleClassification
                          ? "Recorded"
                          : "Incomplete"}
                      </td>
                      <td>{examinerStatus(finding)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </section>

          <section className="print-method-section print-method-single">
            <div>
              <h2>Method</h2>
              <p>
                Winter&apos;s Classification is calculated from the angle
                between the examiner-positioned long axes of the mandibular
                third molar and adjacent second molar.{" "}
                {WINTER_THRESHOLD_SUMMARY} Pericoronitis must be recorded
                separately using the defined clinical examination criteria.
              </p>
            </div>
          </section>

          <footer className="print-report-footer">
            For MDS thesis presentation demonstration only - examiner
            verification required.
          </footer>
        </article>
      </section>
    </div>
  );
}
