"use client";

import Link from "next/link";
import { forwardRef, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  AlertTriangle,
  Check,
  ChevronDown,
  Download,
  Eye,
  FileText,
  Printer,
  Save,
  Trash2,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ImageViewer } from "./image-viewer";
import { StudyPrintPreview } from "./print-preview";
import { TechnicalMethodCard } from "./technical-method-card";
import type { GeometryResult } from "@/features/opg-analysis/geometry";
import { winterAngulationClassification } from "@/features/opg-analysis/geometry";
import { buildDraftReport } from "@/features/opg-analysis/report-builder";
import {
  createAnnotatedRadiographPng,
  downloadStudyPdf,
} from "@/features/opg-analysis/pdf-export";
import { temporaryStudyStore } from "@/features/opg-analysis/storage/temporary-study-store";
import { normalizeStoredStudyLaterality } from "@/features/opg-analysis/result-normalization";
import type {
  FindingReviewStatus,
  OPGFinding,
  TemporaryStudy,
} from "@/features/opg-analysis/types";
import {
  THESIS_DEPARTMENT,
  THESIS_INSTITUTION,
  THESIS_PRESENTER,
  THESIS_PRESENTER_ROLE,
  THESIS_TITLE,
  THESIS_TOOL_NAME,
  WINTER_THRESHOLD_SUMMARY,
} from "@/features/opg-analysis/thesis-copy";

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
  const [showBilateralMeasurements, setShowBilateralMeasurements] =
    useState(false);

  useEffect(() => {
    void temporaryStudyStore
      .get(analysisId)
      .then(async (value) => {
        const normalized = value
          ? normalizeStoredStudyLaterality(value)
          : undefined;
        if (normalized && normalized !== value) {
          await temporaryStudyStore.put(normalized);
        }
        setStudy(normalized);
        setSelectedId(normalized?.result?.findings[0]?.id);
        if (normalized) setImageUrl(URL.createObjectURL(normalized.image));
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
  const selectedToothNumber = findings.find(
    (finding) => finding.id === selectedId,
  )?.angulation?.toothNumber;
  const tooth48Active =
    showBilateralMeasurements || selectedToothNumber === "48";
  const tooth38Active =
    showBilateralMeasurements || selectedToothNumber === "38";
  const manualMeasurementCount = findings.filter(
    (finding) => finding.angulation?.measurementSource === "clinician_geometry",
  ).length;
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
      description: `Winter's classification from the examiner-placed third-molar and adjacent second-molar long axes is ${readableSuggestion} (${geometry.signedRotationDegrees}° signed Winter angle). This records the OPG position category for the prospective study; examiner confirmation is required.`,
      probability: undefined,
      angulation: {
        ...finding.angulation,
        ...geometry,
        classification: suggestion,
        studyEligibleClassification:
          suggestion !== "unable_to_assess" && suggestion !== "other",
        measurementSource: "clinician_geometry",
        referenceMethod:
          "Adjacent mandibular second-molar long axis (examiner-positioned)",
        classificationMethod: `Proposal-aligned Winter long-axis method. ${WINTER_THRESHOLD_SUMMARY} Examiner confirmation required.`,
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
    setShowBilateralMeasurements(false);
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
    setShowBilateralMeasurements(false);
    setSelectedId(id);
    findingRefs.current[id]?.scrollIntoView({
      behavior: "smooth",
      block: "center",
    });
  }
  function selectToothPanel(toothNumber: "38" | "48") {
    const finding = findings.find(
      (item) => item.angulation?.toothNumber === toothNumber,
    );
    if (!finding) return;
    setShowBilateralMeasurements(false);
    setSelectedId(finding.id);
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
      "Observation summary generated",
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
            <Link href="/opg-assistant">{THESIS_TOOL_NAME}</Link>
            <span>/</span> Angulation results
          </div>
          <h1>OPG Angulation Measurement</h1>
          <p className="research-title">{THESIS_TITLE}</p>
          <div
            className="academic-author analysis-author"
            aria-label="Research author"
          >
            <strong className="academic-author-name">{THESIS_PRESENTER}</strong>
            <span className="academic-author-role">
              {THESIS_PRESENTER_ROLE}
            </span>
            <span className="academic-author-affiliation">
              {THESIS_DEPARTMENT}
            </span>
            <span className="academic-author-affiliation">
              {THESIS_INSTITUTION}
            </span>
          </div>
          <p className="analysis-study-meta">
            {study.studyReference
              ? `Study ${study.studyReference}`
              : "No anonymous reference"}{" "}
            · generated {new Date(study.result.generatedAt).toLocaleString()}
          </p>
        </div>
        <div className="analysis-actions">
          <span className="mode-badge">Presentation demo</span>
          <Button variant="danger" onClick={() => void deleteStudy()}>
            <Trash2 size={16} /> Delete current OPG
          </Button>
        </div>
      </div>
      <div className="shell">
        <TechnicalMethodCard />
      </div>
      <section className="bilateral-observation-header shell">
        <div>
          <div className="eyebrow">MDS thesis presentation</div>
          <h2>Bilateral Angulation Results</h2>
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
      <div className="analysis-grid bilateral-grid">
        <section
          className={`findings-column side-findings ${tooth48Active ? "selected-side-panel" : ""}`}
          aria-labelledby="finding-48-title"
          tabIndex={0}
          onClick={() => selectToothPanel("48")}
          onKeyDown={(event) => {
            if (
              event.target === event.currentTarget &&
              (event.key === "Enter" || event.key === " ")
            ) {
              event.preventDefault();
              selectToothPanel("48");
            }
          }}
        >
          <div className="findings-header">
            <div>
              <h2 id="finding-48-title">Tooth 48</h2>
              <p>Mandibular right third molar · near R marker</p>
            </div>
            {tooth48Active && (
              <span className="active-tooth-badge">
                {showBilateralMeasurements ? "Both active" : "Active tooth"}
              </span>
            )}
          </div>
          <div
            className={`panel-selection-strip ${tooth48Active ? "active" : ""}`}
          >
            {showBilateralMeasurements
              ? "Both measurements are displayed"
              : tooth48Active
                ? "Selected for measurement"
                : "Select Tooth 48 to measure"}
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
                  onReset={() => void resetGeometry(finding.id)}
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
            showBilateralMeasurements={showBilateralMeasurements}
            onBilateralVisibilityChange={setShowBilateralMeasurements}
          />
          <div className="model-strip">
            <div>
              <span>Measurement status</span>
              <strong>
                <i className="status-dot" /> {manualMeasurementCount}/2 teeth
                measured
              </strong>
            </div>
            <div>
              <span>Measurement method</span>
              <strong>Winter long-axis geometry</strong>
            </div>
            <div>
              <span>OPG suitability</span>
              <strong className="quality-limited">
                Examiner check required
              </strong>
            </div>
            <div>
              <span>Examiner verification</span>
              <strong>Required</strong>
            </div>
          </div>
        </section>
        <section
          className={`findings-column side-findings ${tooth38Active ? "selected-side-panel" : ""}`}
          aria-labelledby="finding-38-title"
          tabIndex={0}
          onClick={() => selectToothPanel("38")}
          onKeyDown={(event) => {
            if (
              event.target === event.currentTarget &&
              (event.key === "Enter" || event.key === " ")
            ) {
              event.preventDefault();
              selectToothPanel("38");
            }
          }}
        >
          <div className="findings-header">
            <div>
              <h2 id="finding-38-title">Tooth 38</h2>
              <p>Mandibular left third molar · near L marker</p>
            </div>
            {tooth38Active && (
              <span className="active-tooth-badge">
                {showBilateralMeasurements ? "Both active" : "Active tooth"}
              </span>
            )}
          </div>
          <div
            className={`panel-selection-strip ${tooth38Active ? "active" : ""}`}
          >
            {showBilateralMeasurements
              ? "Both measurements are displayed"
              : tooth38Active
                ? "Selected for measurement"
                : "Select Tooth 38 to measure"}
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
                  onReset={() => void resetGeometry(finding.id)}
                />
              ))}
          </div>
        </section>
      </div>
      <section className="report-section shell">
        <div className="report-controls">
          <div>
            <div className="eyebrow">Presentation record</div>
            <h2>Presentation notes and observation summary</h2>
            <p>
              Add brief notes for the thesis demonstration and generate an
              editable observation summary.
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
              <FileText size={17} /> Generate observation summary
            </Button>
          </div>
        </div>
        <label className="field-label" htmlFor="comments">
          Presentation notes
        </label>
        <textarea
          id="comments"
          className="comments-input"
          value={study.comments}
          onChange={(event) =>
            setStudy({ ...study, comments: event.target.value })
          }
          onBlur={() => void temporaryStudyStore.put(study)}
          placeholder="Add presentation notes, measurement comments, or limitations. Do not enter patient identifiers."
        />
        {reportOpen && (
          <div className="report-editor">
            <div className="report-editor-heading">
              <div>
                <h3>Editable observation summary</h3>
                <span>Examiner verification required</span>
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
              aria-label="Observation summary"
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
    onReset: () => void;
  }
>(function FindingCard(
  { finding, selected, onSelect, onUpdate, onReset },
  ref,
) {
  const isMeasured =
    finding.angulation?.measurementSource === "clinician_geometry";
  const statusLabel: Record<FindingReviewStatus, string> = {
    unreviewed: "Awaiting measurement",
    accepted: "Confirmed",
    rejected: "Repeat required",
    edited: "Measured — confirm",
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
      <p>{finding.description}</p>
      {finding.angulation && (
        <AngulationPanel finding={finding} onUpdate={onUpdate} />
      )}
      {isMeasured && (
        <div className="finding-actions">
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
            <Check size={15} /> Confirm result
          </Button>
          <Button
            variant="ghost"
            onClick={(event) => {
              event.stopPropagation();
              onSelect();
              onReset();
            }}
          >
            <X size={15} /> Repeat measurement
          </Button>
        </div>
      )}
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
  return (
    <details className="measurement-panel" open>
      <summary>
        {"Winter position and calculation"} <ChevronDown size={15} />
      </summary>
      <div className="angle-result">
        <div>
          <span>
            {isManual
              ? "Winter's classification — confirm"
              : "Awaiting examiner marking"}
          </span>
          <select
            className="classification-select"
            value={angle.classification}
            disabled={!isManual}
            aria-label={`Winter classification for tooth ${angle.toothNumber}`}
            onClick={(event) => event.stopPropagation()}
            onChange={(event) =>
              onUpdate({
                angulation: {
                  ...angle,
                  classification: event.target
                    .value as typeof angle.classification,
                  studyEligibleClassification: [
                    "mesioangular",
                    "distoangular",
                    "vertical",
                    "horizontal",
                  ].includes(event.target.value),
                },
                reviewStatus: "edited",
                annotationSource: "clinician",
              })
            }
          >
            <option value="mesioangular">Mesioangular</option>
            <option value="distoangular">Distoangular</option>
            <option value="vertical">Vertical</option>
            <option value="horizontal">Horizontal</option>
            <option value="other">Other — manual correction</option>
            <option value="unable_to_assess">Unable to assess</option>
          </select>
        </div>
        <div>
          <span>Signed Winter angle</span>
          <strong>
            {angle.signedRotationDegrees ?? "—"}°{" "}
            {angle.measurementUncertaintyDegrees !== undefined && (
              <small>±{angle.measurementUncertaintyDegrees}°</small>
            )}
          </strong>
        </div>
      </div>
      <dl className="measurement-grid">
        <div>
          <dt>Measurement source</dt>
          <dd>{isManual ? "Examiner-positioned geometry" : "Not measured"}</dd>
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
          <dt>Study position category</dt>
          <dd>
            {isManual && angle.studyEligibleClassification
              ? `Recorded — ${angle.classification.replaceAll("_", " ")}`
              : "Awaiting a measurable Winter classification"}
          </dd>
        </div>
        <div>
          <dt>Signed Winter angle</dt>
          <dd>
            {angle.signedRotationDegrees !== undefined
              ? `${angle.signedRotationDegrees}°`
              : "—"}
          </dd>
        </div>
        <div>
          <dt>Calculation</dt>
          <dd>
            anatomical signed(third-molar axis − second-molar axis) ={" "}
            {angle.signedRotationDegrees ?? "—"}°
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
          : "Place all four examiner points to calculate a new result."}{" "}
        Angulation is a study exposure, not a pericoronitis diagnosis.
      </p>
    </details>
  );
}
