"use client";

import Link from "next/link";
import { forwardRef, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  AlertTriangle,
  Check,
  ChevronDown,
  Download,
  Edit3,
  Eye,
  FileText,
  Info,
  Printer,
  Save,
  Trash2,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { SafetyNotice } from "./safety-notice";
import { ImageViewer } from "./image-viewer";
import { StudyPrintPreview } from "./print-preview";
import type { GeometryResult } from "@/features/opg-analysis/geometry";
import { winterAngulationClassification } from "@/features/opg-analysis/geometry";
import { buildDraftReport } from "@/features/opg-analysis/report-builder";
import {
  createAnnotatedRadiographPng,
  downloadStudyPdf,
} from "@/features/opg-analysis/pdf-export";
import { temporaryStudyStore } from "@/features/opg-analysis/storage/temporary-study-store";
import type {
  FindingReviewStatus,
  OPGFinding,
  TemporaryStudy,
} from "@/features/opg-analysis/types";

export function AnalysisWorkspace({ analysisId }: { analysisId: string }) {
  const router = useRouter();
  const findingRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const [study, setStudy] = useState<TemporaryStudy>();
  const [imageUrl, setImageUrl] = useState<string>();
  const [selectedId, setSelectedId] = useState<string>();
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<string>();
  const [reportOpen, setReportOpen] = useState(false);
  const [printPreviewImageUrl, setPrintPreviewImageUrl] = useState<string>();
  const [previewLoading, setPreviewLoading] = useState(false);
  const [pdfExporting, setPdfExporting] = useState(false);

  useEffect(() => {
    void temporaryStudyStore
      .get(analysisId)
      .then((value) => {
        setStudy(value);
        setSelectedId(value?.result?.findings[0]?.id);
        if (value) setImageUrl(URL.createObjectURL(value.image));
      })
      .catch(() => setMessage("Temporary browser storage could not be read."))
      .finally(() => setLoading(false));
  }, [analysisId]);
  useEffect(
    () => () => {
      if (imageUrl) URL.revokeObjectURL(imageUrl);
    },
    [imageUrl],
  );
  useEffect(
    () => () => {
      if (printPreviewImageUrl) URL.revokeObjectURL(printPreviewImageUrl);
    },
    [printPreviewImageUrl],
  );

  const reviewedCount =
    study?.result?.findings.filter(
      (finding) => finding.reviewStatus !== "unreviewed",
    ).length ?? 0;
  const findings = study?.result?.findings ?? [];
  const hasBilateralManualMeasurements = ["38", "48"].every((toothNumber) =>
    findings.some(
      (finding) =>
        finding.angulation?.toothNumber === toothNumber &&
        finding.angulation.measurementSource === "clinician_geometry" &&
        finding.angulation.toothAxis &&
        finding.angulation.referenceAxis,
    ),
  );

  async function updateStudy(next: TemporaryStudy, notice?: string) {
    setStudy(next);
    await temporaryStudyStore.put(next);
    if (notice) {
      setMessage(notice);
      window.setTimeout(() => setMessage(undefined), 2400);
    }
  }
  async function updateFinding(id: string, patch: Partial<OPGFinding>) {
    if (!study?.result) return;
    const next = {
      ...study,
      result: {
        ...study.result,
        findings: study.result.findings.map((finding) =>
          finding.id === id ? { ...finding, ...patch } : finding,
        ),
      },
    };
    await updateStudy(next, "Review saved locally");
  }
  async function updateGeometry(id: string, geometry: GeometryResult) {
    const finding = study?.result?.findings.find((item) => item.id === id);
    if (!finding?.angulation) return;
    const suggestion = winterAngulationClassification(
      finding.angulation.toothNumber,
      geometry.signedRotationDegrees,
    );
    const readableSuggestion =
      suggestion === "unable_to_assess" ? "unable to assess" : suggestion;
    await updateFinding(id, {
      title: `Tooth ${finding.angulation.toothNumber} — Winter result: ${readableSuggestion}`,
      description: `Winter's classification from the examiner-placed third-molar and adjacent second-molar long axes is ${readableSuggestion} (${geometry.relativeAngleDegrees}° acute angle). ${suggestion === "mesioangular" || suggestion === "distoangular" ? "Eligible for the thesis angulation cohort" : "Outside the thesis mesioangular/distoangular cohort"}; clinician confirmation is required.`,
      probability: undefined,
      angulation: {
        ...finding.angulation,
        ...geometry,
        classification: suggestion,
        studyEligibleClassification:
          suggestion === "mesioangular" || suggestion === "distoangular",
        measurementSource: "clinician_geometry",
        referenceMethod:
          "Adjacent mandibular second-molar long axis (examiner-positioned)",
        classificationMethod:
          "Winter long-axis method: vertical ≤10°; mesioangular or distoangular >10° and <80° according to side/direction; horizontal 80–100°; other >100°. Clinician confirmation required.",
        modelEstimatedProbability: undefined,
        measurementUncertaintyDegrees: undefined,
        specialistReviewRequired: true,
      },
      annotationSource: "clinician",
      reviewStatus: "edited",
    });
  }
  async function resetGeometry(id: string) {
    const finding = study?.result?.findings.find((item) => item.id === id);
    if (!finding?.angulation) return;
    const toothNumber = finding.angulation.toothNumber;
    await updateFinding(id, {
      title: `Tooth ${toothNumber} — ready for a new measurement`,
      description:
        "Previous examiner markings were cleared. Place the four axis points again from the beginning.",
      probability: undefined,
      angulation: {
        ...finding.angulation,
        classification: "unable_to_assess",
        toothLongAxisDegrees: undefined,
        referenceAxisDegrees: undefined,
        relativeAngleDegrees: undefined,
        signedRotationDegrees: undefined,
        toothAxis: undefined,
        referenceAxis: undefined,
        measurementUncertaintyDegrees: undefined,
        modelEstimatedProbability: undefined,
        studyEligibleClassification: false,
        measurementSource: "unmeasured",
        referenceMethod:
          "Adjacent mandibular second-molar long axis (awaiting examiner points)",
        classificationMethod:
          "Not classified — clinician axis measurement was reset",
      },
      annotationSource: "clinician",
      reviewStatus: "unreviewed",
    });
  }
  function selectFinding(id: string) {
    setSelectedId(id);
    findingRefs.current[id]?.scrollIntoView({
      behavior: "smooth",
      block: "center",
    });
  }
  async function deleteStudy() {
    if (
      !window.confirm(
        "Delete this image and all temporary review data from this browser?",
      )
    )
      return;
    await temporaryStudyStore.delete(analysisId);
    router.push("/opg-assistant");
  }
  async function generateReport() {
    if (!study?.result) return;
    const draft = buildDraftReport(study.result, study.comments);
    await updateStudy(
      { ...study, reportDraft: draft },
      "Draft report generated",
    );
    setReportOpen(true);
  }
  async function openPrintPreview() {
    if (!study?.result || !hasBilateralManualMeasurements) return;
    setPreviewLoading(true);
    try {
      const blob = await createAnnotatedRadiographPng(
        study.image,
        study.result.findings,
      );
      if (printPreviewImageUrl) URL.revokeObjectURL(printPreviewImageUrl);
      setPrintPreviewImageUrl(URL.createObjectURL(blob));
    } catch {
      setMessage("The annotated print preview could not be prepared.");
    } finally {
      setPreviewLoading(false);
    }
  }
  function closePrintPreview() {
    if (printPreviewImageUrl) URL.revokeObjectURL(printPreviewImageUrl);
    setPrintPreviewImageUrl(undefined);
  }
  async function exportPdf() {
    if (!study?.result || !hasBilateralManualMeasurements) return;
    setPdfExporting(true);
    try {
      await downloadStudyPdf(study);
      setMessage("Formatted PDF downloaded");
    } catch {
      setMessage("The PDF could not be generated.");
    } finally {
      setPdfExporting(false);
    }
  }

  if (loading)
    return (
      <div className="shell loading-page" aria-live="polite">
        <div className="skeleton wide" />
        <div className="skeleton" />
        Loading temporary analysis…
      </div>
    );
  if (!study?.result || !imageUrl)
    return (
      <div className="shell empty-state">
        <AlertTriangle />
        <h1>Analysis unavailable</h1>
        <p>
          This browser-local analysis may have expired, been deleted, or been
          created on another device.
        </p>
        {message && <p className="error-message">{message}</p>}
        <Link className="button button-primary" href="/opg-assistant">
          Start a new analysis
        </Link>
      </div>
    );

  return (
    <div className="analysis-page">
      <div className="analysis-topbar shell">
        <div>
          <div className="breadcrumb">
            <Link href="/opg-assistant">OPG Assistant</Link>
            <span>/</span> Analysis review
          </div>
          <h1>Specialist review workspace</h1>
          <p>
            {study.studyReference
              ? `Study ${study.studyReference}`
              : "No anonymous reference"}{" "}
            · generated {new Date(study.result.generatedAt).toLocaleString()}
          </p>
        </div>
        <div className="analysis-actions">
          <span className="mode-badge">{study.result.analysisMode} mode</span>
          <Button variant="danger" onClick={() => void deleteStudy()}>
            <Trash2 size={16} /> Delete study
          </Button>
        </div>
      </div>
      <div className="shell">
        <SafetyNotice compact />
      </div>
      <section className="bilateral-observation-header shell">
        <div>
          <div className="eyebrow">Bilateral review</div>
          <h2>Demonstration observations</h2>
          <p>
            Tooth 38 is displayed on the left and tooth 48 on the right of the
            radiograph.
          </p>
        </div>
        <div
          className="progress-ring"
          style={
            {
              "--progress": `${findings.length ? (reviewedCount / findings.length) * 360 : 0}deg`,
            } as React.CSSProperties
          }
        >
          <span>
            {reviewedCount}/{findings.length}
          </span>
        </div>
      </section>
      <div className="mock-warning bilateral-warning shell">
        <Info size={18} />
        <span>
          <strong>Thesis scope: teeth 38 and 48 only.</strong> Mock
          classifications are not image-derived; pericoronitis is not determined
          from an OPG.
        </span>
      </div>
      <div className="analysis-grid bilateral-grid">
        <section
          className="findings-column side-findings"
          aria-labelledby="finding-38-title"
        >
          <div className="findings-header">
            <div>
              <span className="side-label">Left side</span>
              <h2 id="finding-38-title">Tooth 38</h2>
              <p>Mandibular left third molar</p>
            </div>
          </div>
          <div className="findings-list">
            {findings
              .filter((finding) => finding.angulation?.toothNumber === "38")
              .map((finding) => (
                <FindingCard
                  key={finding.id}
                  finding={finding}
                  selected={selectedId === finding.id}
                  ref={(node) => {
                    findingRefs.current[finding.id] = node;
                  }}
                  onSelect={() => setSelectedId(finding.id)}
                  onUpdate={(patch) => void updateFinding(finding.id, patch)}
                />
              ))}
          </div>
        </section>
        <section className="viewer-column">
          <ImageViewer
            key={selectedId}
            imageUrl={imageUrl}
            findings={findings}
            selectedId={selectedId}
            onSelect={selectFinding}
            onGeometryChange={(id, geometry) =>
              void updateGeometry(id, geometry)
            }
            onGeometryReset={(id) => void resetGeometry(id)}
          />
          <div className="model-strip">
            <div>
              <span>Analysis status</span>
              <strong>
                <i className="status-dot" /> Demonstration complete
              </strong>
            </div>
            <div>
              <span>Model / version</span>
              <strong>
                {study.result.modelName} · {study.result.modelVersion}
              </strong>
            </div>
            <div>
              <span>Image quality</span>
              <strong className="quality-limited">
                {study.result.imageQuality}
              </strong>
            </div>
            <div>
              <span>Human review</span>
              <strong>Required</strong>
            </div>
          </div>
        </section>
        <section
          className="findings-column side-findings"
          aria-labelledby="finding-48-title"
        >
          <div className="findings-header">
            <div>
              <span className="side-label">Right side</span>
              <h2 id="finding-48-title">Tooth 48</h2>
              <p>Mandibular right third molar</p>
            </div>
          </div>
          <div className="findings-list">
            {findings
              .filter((finding) => finding.angulation?.toothNumber === "48")
              .map((finding) => (
                <FindingCard
                  key={finding.id}
                  finding={finding}
                  selected={selectedId === finding.id}
                  ref={(node) => {
                    findingRefs.current[finding.id] = node;
                  }}
                  onSelect={() => setSelectedId(finding.id)}
                  onUpdate={(patch) => void updateFinding(finding.id, patch)}
                />
              ))}
          </div>
        </section>
      </div>
      <section className="report-section shell">
        <div className="report-controls">
          <div>
            <div className="eyebrow">Clinician input</div>
            <h2>Overall comments and draft report</h2>
            <p>
              Rejected observations are excluded. The report remains editable
              and cannot be electronically signed.
            </p>
          </div>
          <div className="report-actions">
            <Button
              variant="secondary"
              disabled={!hasBilateralManualMeasurements || previewLoading}
              onClick={() => void openPrintPreview()}
              title={
                hasBilateralManualMeasurements
                  ? undefined
                  : "Complete manual measurements for teeth 38 and 48 first"
              }
            >
              <Eye size={17} />
              {previewLoading ? "Preparing preview…" : "Print preview"}
            </Button>
            <Button
              variant="secondary"
              disabled={!hasBilateralManualMeasurements || pdfExporting}
              onClick={() => void exportPdf()}
            >
              <Download size={17} />
              {pdfExporting ? "Preparing PDF…" : "Download PDF"}
            </Button>
            <Button onClick={() => void generateReport()}>
              <FileText size={17} /> Generate draft report
            </Button>
          </div>
        </div>
        <label className="field-label" htmlFor="comments">
          Overall clinician comments
        </label>
        <textarea
          id="comments"
          className="comments-input"
          value={study.comments}
          onChange={(event) =>
            setStudy({ ...study, comments: event.target.value })
          }
          onBlur={() => void temporaryStudyStore.put(study)}
          placeholder="Add clinical context, corrections, or limitations. Do not enter patient identifiers."
        />
        {reportOpen && (
          <div className="report-editor">
            <div className="report-editor-heading">
              <div>
                <h3>Editable draft</h3>
                <span>Specialist approval required</span>
              </div>
              <div>
                <Button
                  variant="secondary"
                  disabled={!hasBilateralManualMeasurements || previewLoading}
                  onClick={() => void openPrintPreview()}
                >
                  <Printer size={16} /> Print preview
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => setReportOpen(false)}
                  aria-label="Close report"
                >
                  <X size={17} />
                </Button>
              </div>
            </div>
            <textarea
              aria-label="Draft report"
              value={study.reportDraft || ""}
              onChange={(event) =>
                setStudy({ ...study, reportDraft: event.target.value })
              }
              onBlur={() => void temporaryStudyStore.put(study)}
            />
          </div>
        )}
      </section>
      {printPreviewImageUrl && (
        <StudyPrintPreview
          study={study}
          annotatedImageUrl={printPreviewImageUrl}
          downloading={pdfExporting}
          onClose={closePrintPreview}
          onDownload={() => void exportPdf()}
        />
      )}
      {message && (
        <div className="toast" role="status">
          <Save size={17} /> {message}
        </div>
      )}
    </div>
  );
}

const FindingCard = forwardRef<
  HTMLDivElement,
  {
    finding: OPGFinding;
    selected: boolean;
    onSelect: () => void;
    onUpdate: (patch: Partial<OPGFinding>) => void;
  }
>(function FindingCard({ finding, selected, onSelect, onUpdate }, ref) {
  const [editing, setEditing] = useState(false);
  const [description, setDescription] = useState(finding.description);
  const probability =
    finding.probability ?? finding.angulation?.modelEstimatedProbability;
  const statusLabel: Record<FindingReviewStatus, string> = {
    unreviewed: "Unreviewed",
    accepted: "Accepted",
    rejected: "Rejected",
    edited: "Edited",
  };
  return (
    <div
      ref={ref}
      className={`finding-card ${selected ? "selected" : ""} status-${finding.reviewStatus}`}
      onClick={onSelect}
    >
      <div className="finding-top">
        <span className="category-label">
          {finding.category.replaceAll("_", " ")}
        </span>
        <span className="review-label">
          {statusLabel[finding.reviewStatus]} <ChevronDown size={14} />
        </span>
      </div>
      <h3>{finding.title}</h3>
      {finding.region && (
        <p className="region">
          {finding.region}
          {finding.toothNumbers &&
            ` · Tooth ${finding.toothNumbers.join(", ")}`}
        </p>
      )}
      {editing ? (
        <textarea
          className="finding-edit"
          value={description}
          onChange={(event) => setDescription(event.target.value)}
        />
      ) : (
        <p>{finding.description}</p>
      )}
      {typeof probability === "number" && (
        <div className="probability">
          <span>Model-estimated probability</span>
          <strong>{Math.round(probability * 100)}%</strong>
          <div>
            <i style={{ width: `${probability * 100}%` }} />
          </div>
          <small>Not diagnostic certainty</small>
        </div>
      )}
      {finding.angulation && (
        <AngulationPanel finding={finding} onUpdate={onUpdate} />
      )}
      <div className="finding-actions">
        {editing ? (
          <Button
            variant="secondary"
            onClick={(event) => {
              event.stopPropagation();
              setEditing(false);
              onUpdate({
                description,
                originalDescription:
                  finding.originalDescription || finding.description,
                reviewStatus: "edited",
                annotationSource: "clinician",
              });
            }}
          >
            <Save size={15} /> Save edit
          </Button>
        ) : (
          <>
            <Button
              variant="ghost"
              className={
                finding.reviewStatus === "accepted" ? "active-accept" : ""
              }
              onClick={(event) => {
                event.stopPropagation();
                onUpdate({
                  reviewStatus: "accepted",
                  annotationSource: "clinician",
                });
              }}
            >
              <Check size={15} /> Accept
            </Button>
            <Button
              variant="ghost"
              className={
                finding.reviewStatus === "rejected" ? "active-reject" : ""
              }
              onClick={(event) => {
                event.stopPropagation();
                onUpdate({ reviewStatus: "rejected" });
              }}
            >
              <X size={15} /> Reject
            </Button>
            <Button
              variant="ghost"
              onClick={(event) => {
                event.stopPropagation();
                setEditing(true);
              }}
            >
              <Edit3 size={15} /> Edit
            </Button>
          </>
        )}
      </div>
    </div>
  );
});

function AngulationPanel({
  finding,
  onUpdate,
}: {
  finding: OPGFinding;
  onUpdate: (patch: Partial<OPGFinding>) => void;
}) {
  const angle = finding.angulation!;
  const isManual = angle.measurementSource === "clinician_geometry";
  const isUnmeasured = angle.measurementSource === "unmeasured";
  return (
    <details className="measurement-panel" open>
      <summary>
        {"Winter's classification and calculation"} <ChevronDown size={15} />
      </summary>
      <div className="angle-result">
        <div>
          <span>
            {isManual
              ? "Winter's classification — confirm"
              : isUnmeasured
                ? "Awaiting new measurement"
                : "Mock Winter demonstration"}
          </span>
          <select
            className="classification-select"
            value={angle.classification}
            onClick={(event) => event.stopPropagation()}
            onChange={(event) =>
              onUpdate({
                angulation: {
                  ...angle,
                  classification: event.target
                    .value as typeof angle.classification,
                  studyEligibleClassification:
                    event.target.value === "mesioangular" ||
                    event.target.value === "distoangular",
                },
                reviewStatus: "edited",
                annotationSource: "clinician",
              })
            }
          >
            <option value="mesioangular">Mesioangular</option>
            <option value="distoangular">Distoangular</option>
            <option value="vertical">Vertical — outside thesis scope</option>
            <option value="horizontal">
              Horizontal — outside thesis scope
            </option>
            <option value="other">Other — outside thesis scope</option>
            <option value="unable_to_assess">Unable to assess</option>
          </select>
        </div>
        <div>
          <span>Acute relative angle</span>
          <strong>
            {angle.relativeAngleDegrees ?? "—"}°{" "}
            {angle.measurementUncertaintyDegrees !== undefined && (
              <small>±{angle.measurementUncertaintyDegrees}°</small>
            )}
          </strong>
        </div>
      </div>
      <dl className="measurement-grid">
        <div>
          <dt>Measurement source</dt>
          <dd>
            {isManual
              ? "Clinician geometry"
              : isUnmeasured
                ? "Not measured"
                : "Mock demonstration"}
          </dd>
        </div>
        <div>
          <dt>Mandibular third molar</dt>
          <dd>FDI {angle.toothNumber}</dd>
        </div>
        <div>
          <dt>Tooth-axis orientation</dt>
          <dd>{angle.toothLongAxisDegrees ?? "—"}°</dd>
        </div>
        <div>
          <dt>Second-molar axis orientation</dt>
          <dd>{angle.referenceAxisDegrees ?? "—"}°</dd>
        </div>
        <div>
          <dt>Thesis cohort eligibility</dt>
          <dd>
            {angle.studyEligibleClassification
              ? "Eligible — mesioangular/distoangular"
              : "Not eligible — outside selected angulations"}
          </dd>
        </div>
        <div>
          <dt>Signed rotation</dt>
          <dd>
            {angle.signedRotationDegrees !== undefined
              ? `${angle.signedRotationDegrees}°`
              : "—"}
          </dd>
        </div>
        <div>
          <dt>Calculation</dt>
          <dd>
            acute(|third-molar axis − second-molar axis|) ={" "}
            {angle.relativeAngleDegrees ?? "—"}°
          </dd>
        </div>
        <div className="full">
          <dt>Reference method</dt>
          <dd>{angle.referenceMethod}</dd>
        </div>
        <div className="full">
          <dt>Pericoronitis outcome</dt>
          <dd>
            Not assessed from OPG — record using the thesis clinical examination
            criteria.
          </dd>
        </div>
        <div className="full">
          <dt>Classification method</dt>
          <dd>{angle.classificationMethod}</dd>
        </div>
      </dl>
      <p className="measurement-caution">
        <AlertTriangle size={15} />{" "}
        {isManual
          ? "Calculated from the four points placed by the examiner. Confirm the landmark protocol and classification manually."
          : isUnmeasured
            ? "The previous points were removed. Place all four points again to calculate a new result."
            : "Mock measurement—not calculated from this image. Use Measure axes to create a real geometric measurement."}{" "}
        Angulation is a study exposure, not a pericoronitis diagnosis.
      </p>
    </details>
  );
}
