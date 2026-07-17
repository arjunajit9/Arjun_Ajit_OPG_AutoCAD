"use client";

import Image from "next/image";
import { Download, Printer, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { OPGFinding, TemporaryStudy } from "@/features/opg-analysis/types";

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
            <span>A4 landscape · two-page PDF</span>
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
              <span>Specialist review document</span>
              <h1 id="print-preview-title">
                Mandibular third molar angulation report
              </h1>
              <p>Winter classification · FDI teeth 38 and 48</p>
            </div>
            <div className="print-report-meta">
              <strong>{study.studyReference || "Anonymous study"}</strong>
              <span>{new Date().toLocaleString()}</span>
              <span>Image quality: {result.imageQuality}</span>
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
                    {toothNumber === "38" ? "Left side" : "Right side"}
                  </span>
                  <h2>Tooth {toothNumber}</h2>
                  <strong>
                    {angle
                      ? `${angle.classification.replaceAll("_", " ")} · ${angle.relativeAngleDegrees}°`
                      : "Not measured"}
                  </strong>
                  <small>
                    {angle?.studyEligibleClassification
                      ? "Eligible for thesis angulation cohort"
                      : "Not eligible or measurement incomplete"}
                  </small>
                </article>
              );
            })}
          </section>

          <section className="print-detail-section">
            <h2>Measurement calculations</h2>
            <table>
              <thead>
                <tr>
                  <th>Tooth</th>
                  <th>Winter result</th>
                  <th>Acute angle</th>
                  <th>Third-molar axis</th>
                  <th>Second-molar axis</th>
                  <th>Signed rotation</th>
                  <th>Review</th>
                </tr>
              </thead>
              <tbody>
                {bilateral.map(({ toothNumber, finding }) => {
                  const angle = finding?.angulation;
                  return (
                    <tr key={`detail-${toothNumber}`}>
                      <th>FDI {toothNumber}</th>
                      <td>
                        {angle?.classification.replaceAll("_", " ") || "—"}
                      </td>
                      <td>{angle?.relativeAngleDegrees ?? "—"}°</td>
                      <td>{angle?.toothLongAxisDegrees ?? "—"}°</td>
                      <td>{angle?.referenceAxisDegrees ?? "—"}°</td>
                      <td>{angle?.signedRotationDegrees ?? "—"}°</td>
                      <td>{finding?.reviewStatus || "unreviewed"}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </section>

          <section className="print-method-section">
            <div>
              <h2>Method</h2>
              <p>
                Winter classification is calculated from the examiner-positioned
                long axes of the mandibular third molar and adjacent second
                molar. Only mesioangular and distoangular classifications are
                eligible for this thesis cohort.
              </p>
            </div>
            <div>
              <h2>Clinician comments</h2>
              <p>{study.comments.trim() || "No clinician comments entered."}</p>
            </div>
          </section>

          <footer className="print-report-footer">
            <strong>Specialist review required.</strong> Angulation is a study
            exposure and does not diagnose pericoronitis. Pericoronitis must be
            recorded separately using the defined clinical examination criteria.
          </footer>
        </article>
      </section>
    </div>
  );
}
