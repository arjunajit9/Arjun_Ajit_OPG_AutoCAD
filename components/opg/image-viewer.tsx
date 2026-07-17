"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import {
  Eraser,
  Eye,
  EyeOff,
  Maximize2,
  Minus,
  PencilRuler,
  Plus,
  RotateCcw,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { MeasurementGuide } from "./measurement-guide";
import type {
  MeasurementPoint,
  OPGFinding,
} from "@/features/opg-analysis/types";
import {
  calculateGeometry,
  extendLine,
  lineIntersection,
  type GeometryResult,
} from "@/features/opg-analysis/geometry";

interface ImageViewerProps {
  imageUrl: string;
  findings: OPGFinding[];
  selectedId?: string;
  onSelect: (id: string) => void;
  onGeometryChange: (findingId: string, geometry: GeometryResult) => void;
  onGeometryReset: (findingId: string) => void;
}

export function ImageViewer({
  imageUrl,
  findings,
  selectedId,
  onSelect,
  onGeometryChange,
  onGeometryReset,
}: ImageViewerProps) {
  const imageRef = useRef<HTMLImageElement>(null);
  const [scale, setScale] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [annotations, setAnnotations] = useState(true);
  const [showBilateralMeasurements, setShowBilateralMeasurements] =
    useState(false);
  const [drag, setDrag] = useState<{ x: number; y: number }>();
  const [measurementPoints, setMeasurementPoints] = useState<
    MeasurementPoint[] | null
  >(null);
  const selectedFinding = findings.find((finding) => finding.id === selectedId);

  function addMeasurementPoint(event: React.PointerEvent<HTMLDivElement>) {
    if (!measurementPoints || !selectedId) return;
    event.stopPropagation();
    const rect =
      imageRef.current?.getBoundingClientRect() ??
      event.currentTarget.getBoundingClientRect();
    if (
      event.clientX < rect.left ||
      event.clientX > rect.right ||
      event.clientY < rect.top ||
      event.clientY > rect.bottom
    )
      return;
    const point = {
      x: Math.min(1, Math.max(0, (event.clientX - rect.left) / rect.width)),
      y: Math.min(1, Math.max(0, (event.clientY - rect.top) / rect.height)),
    };
    const next = [...measurementPoints, point];
    setMeasurementPoints(next);
    const geometry = calculateGeometry(next, rect.width / rect.height);
    if (geometry) {
      onGeometryChange(selectedId, geometry);
      setMeasurementPoints(null);
    }
  }

  const partialToothAxis = measurementPoints?.length
    ? measurementPoints.slice(0, 2)
    : undefined;
  const partialReferenceAxis =
    measurementPoints && measurementPoints.length > 2
      ? measurementPoints.slice(2, 4)
      : undefined;
  const completePartialToothAxis =
    partialToothAxis?.length === 2
      ? (partialToothAxis as [MeasurementPoint, MeasurementPoint])
      : undefined;
  const completePartialReferenceAxis =
    partialReferenceAxis?.length === 2
      ? (partialReferenceAxis as [MeasurementPoint, MeasurementPoint])
      : undefined;
  const extendedPartialToothAxis = completePartialToothAxis
    ? extendLine(completePartialToothAxis)
    : undefined;
  const extendedPartialReferenceAxis = completePartialReferenceAxis
    ? extendLine(completePartialReferenceAxis)
    : undefined;
  const measuredFindings = findings.filter(
    (finding) =>
      finding.angulation?.measurementSource === "clinician_geometry" &&
      finding.angulation.toothAxis &&
      finding.angulation.referenceAxis,
  );
  const hasBilateralMeasurements = ["38", "48"].every((toothNumber) =>
    measuredFindings.some(
      (finding) => finding.angulation?.toothNumber === toothNumber,
    ),
  );
  const visibleFindings = measurementPoints
    ? []
    : showBilateralMeasurements
      ? measuredFindings
      : selectedFinding?.angulation?.toothAxis &&
          selectedFinding.angulation.referenceAxis
        ? [selectedFinding]
        : [];
  const overlays = visibleFindings.map(createFindingOverlay);

  return (
    <div className="viewer-card">
      <div className="viewer-toolbar">
        <div>
          <strong>Geometry viewer</strong>
          <span>{Math.round(scale * 100)}%</span>
        </div>
        <div className="tool-buttons">
          <Button
            variant="ghost"
            onClick={() => setScale((value) => Math.max(0.75, value - 0.25))}
            aria-label="Zoom out"
          >
            <Minus size={17} />
          </Button>
          <Button
            variant="ghost"
            onClick={() => setScale((value) => Math.min(3, value + 0.25))}
            aria-label="Zoom in"
          >
            <Plus size={17} />
          </Button>
          <Button
            variant="ghost"
            onClick={() => {
              setScale(1);
              setOffset({ x: 0, y: 0 });
            }}
            aria-label="Reset view"
          >
            <RotateCcw size={17} />
          </Button>
          <Button
            variant="ghost"
            onClick={() => setAnnotations((value) => !value)}
            aria-label={`${annotations ? "Hide" : "Show"} annotations`}
          >
            {annotations ? <Eye size={17} /> : <EyeOff size={17} />}
          </Button>
          <Button
            variant={measurementPoints ? "danger" : "secondary"}
            disabled={!selectedFinding?.angulation}
            onClick={() => setMeasurementPoints((value) => (value ? null : []))}
            aria-label={
              measurementPoints
                ? "Cancel axis measurement"
                : "Measure third and second molar axes"
            }
          >
            {measurementPoints ? <X size={16} /> : <PencilRuler size={16} />}{" "}
            {measurementPoints ? "Cancel" : "Measure axes"}
          </Button>
          <Button
            variant="danger"
            disabled={!selectedFinding?.angulation}
            onClick={() => {
              if (!selectedId) return;
              setShowBilateralMeasurements(false);
              setMeasurementPoints([]);
              onGeometryReset(selectedId);
            }}
            aria-label="Reset marking and start again"
            title="Clear this tooth's saved points and return to point 1"
          >
            <Eraser size={16} /> Reset marking
          </Button>
          <Button
            variant={showBilateralMeasurements ? "primary" : "secondary"}
            disabled={!hasBilateralMeasurements || Boolean(measurementPoints)}
            onClick={() => setShowBilateralMeasurements((current) => !current)}
            aria-pressed={showBilateralMeasurements}
            aria-label={
              showBilateralMeasurements
                ? "Hide both measurements"
                : "Show both measurements"
            }
            title={
              hasBilateralMeasurements
                ? undefined
                : "Complete manual measurements for teeth 38 and 48 first"
            }
          >
            {showBilateralMeasurements ? (
              <EyeOff size={16} />
            ) : (
              <Eye size={16} />
            )}{" "}
            {showBilateralMeasurements ? "Hide both" : "Show both"}
          </Button>
          <MeasurementGuide label="Guide" />
        </div>
      </div>
      {measurementPoints && (
        <div className="measurement-instruction" role="status">
          <strong>Point {measurementPoints.length + 1} of 4:</strong>{" "}
          {
            [
              "tooth root/apical point",
              "tooth crown/occlusal point",
              "adjacent second-molar root/apical point",
              "adjacent second-molar crown/occlusal point",
            ][measurementPoints.length]
          }
          . Click precisely on the image.
        </div>
      )}
      <div
        className={`viewer ${measurementPoints ? "measuring" : ""}`}
        onWheel={(event) => {
          event.preventDefault();
          setScale((value) =>
            Math.min(
              3,
              Math.max(0.75, value + (event.deltaY < 0 ? 0.1 : -0.1)),
            ),
          );
        }}
        onPointerDown={(event) => {
          if (measurementPoints) return;
          event.currentTarget.setPointerCapture(event.pointerId);
          setDrag({ x: event.clientX - offset.x, y: event.clientY - offset.y });
        }}
        onPointerMove={(event) => {
          if (drag && scale > 1)
            setOffset({ x: event.clientX - drag.x, y: event.clientY - drag.y });
        }}
        onPointerUp={() => setDrag(undefined)}
      >
        <div
          className="image-stage"
          onPointerDown={addMeasurementPoint}
          style={{
            transform: `translate(${offset.x}px, ${offset.y}px) scale(${scale})`,
          }}
        >
          <Image
            ref={imageRef}
            src={imageUrl}
            alt="Uploaded panoramic radiograph for specialist review"
            width={1600}
            height={800}
            unoptimized
            draggable={false}
          />
          {annotations &&
            !measurementPoints &&
            findings.map(
              (finding) =>
                finding.boundingBox && (
                  <button
                    key={finding.id}
                    type="button"
                    className={`annotation ${selectedId === finding.id ? "selected" : ""} ${finding.annotationSource === "clinician" ? "confirmed" : "model"}`}
                    style={{
                      left: `${finding.boundingBox.x * 100}%`,
                      top: `${finding.boundingBox.y * 100}%`,
                      width: `${finding.boundingBox.width * 100}%`,
                      height: `${finding.boundingBox.height * 100}%`,
                    }}
                    onClick={(event) => {
                      event.stopPropagation();
                      onSelect(finding.id);
                    }}
                    aria-label={`Select annotation: ${finding.title}`}
                  />
                ),
            )}
          {(overlays.length > 0 || measurementPoints?.length) && (
            <svg
              className="axis-overlay"
              viewBox="0 0 100 50"
              preserveAspectRatio="none"
              aria-hidden="true"
            >
              {overlays.map((overlay) => (
                <g
                  key={overlay.finding.id}
                  className={`measurement-overlay tooth-${overlay.finding.angulation?.toothNumber}`}
                >
                  <line
                    x1={overlay.extendedToothAxis[0].x * 100}
                    y1={overlay.extendedToothAxis[0].y * 50}
                    x2={overlay.extendedToothAxis[1].x * 100}
                    y2={overlay.extendedToothAxis[1].y * 50}
                    className="tooth-axis extended-axis"
                  />
                  <line
                    x1={overlay.extendedReferenceAxis[0].x * 100}
                    y1={overlay.extendedReferenceAxis[0].y * 50}
                    x2={overlay.extendedReferenceAxis[1].x * 100}
                    y2={overlay.extendedReferenceAxis[1].y * 50}
                    className="reference-axis extended-axis"
                  />
                  {overlay.arc && (
                    <g className="angle-marker">
                      <circle
                        cx={overlay.arc.center.x}
                        cy={overlay.arc.center.y}
                        r="1.3"
                      />
                      <path d={overlay.arc.path} />
                    </g>
                  )}
                </g>
              ))}
              {extendedPartialToothAxis && (
                <line
                  x1={extendedPartialToothAxis[0].x * 100}
                  y1={extendedPartialToothAxis[0].y * 50}
                  x2={extendedPartialToothAxis[1].x * 100}
                  y2={extendedPartialToothAxis[1].y * 50}
                  className="tooth-axis extended-axis"
                />
              )}
              {extendedPartialReferenceAxis && (
                <line
                  x1={extendedPartialReferenceAxis[0].x * 100}
                  y1={extendedPartialReferenceAxis[0].y * 50}
                  x2={extendedPartialReferenceAxis[1].x * 100}
                  y2={extendedPartialReferenceAxis[1].y * 50}
                  className="reference-axis extended-axis"
                />
              )}
              {measurementPoints?.map((point, index) => (
                <circle
                  key={`${point.x}-${point.y}-${index}`}
                  cx={point.x * 100}
                  cy={point.y * 50}
                  r="0.65"
                  className={index < 2 ? "tooth-handle" : "reference-handle"}
                />
              ))}
            </svg>
          )}
        </div>
        {!measurementPoints &&
          overlays
            .filter(
              ({ finding }) =>
                finding.angulation?.measurementSource === "clinician_geometry",
            )
            .map(({ finding }) => (
              <div
                key={`readout-${finding.id}`}
                className={`angle-readout angle-readout-${finding.angulation?.toothNumber === "38" ? "left" : "right"}`}
                role="status"
                aria-label={`Tooth ${finding.angulation?.toothNumber} measured angle ${finding.angulation?.relativeAngleDegrees} degrees; ${finding.angulation?.classification}`}
              >
                <span>
                  Tooth {finding.angulation?.toothNumber} · Winter result
                </span>
                <strong>{finding.angulation?.relativeAngleDegrees}°</strong>
                <small>
                  {finding.angulation?.classification.replaceAll("_", " ")} ·
                  confirm clinically
                </small>
              </div>
            ))}
      </div>
      <div className="viewer-legend">
        <span>
          <i className="legend-tooth" /> Third-molar long axis
        </span>
        <span>
          <i className="legend-reference" /> Adjacent second-molar long axis
        </span>
        <span>
          <Maximize2 size={14} /> Scroll to zoom · drag to pan
        </span>
      </div>
    </div>
  );
}

function createFindingOverlay(finding: OPGFinding) {
  const angle = finding.angulation!;
  const toothAxis = angle.toothAxis!;
  const referenceAxis = angle.referenceAxis!;
  const intersection = lineIntersection(toothAxis, referenceAxis);
  let displayRotation = angle.signedRotationDegrees;
  if (displayRotation !== undefined && displayRotation > 90)
    displayRotation -= 180;
  if (displayRotation !== undefined && displayRotation < -90)
    displayRotation += 180;
  const arc =
    intersection &&
    angle.referenceAxisDegrees !== undefined &&
    displayRotation !== undefined
      ? createAngleArc(
          intersection,
          angle.referenceAxisDegrees,
          displayRotation,
        )
      : undefined;
  return {
    finding,
    extendedToothAxis: extendLine(toothAxis),
    extendedReferenceAxis: extendLine(referenceAxis),
    arc,
  };
}

function createAngleArc(
  intersection: MeasurementPoint,
  referenceAngle: number,
  rotation: number,
) {
  const center = { x: intersection.x * 100, y: intersection.y * 50 };
  const radius = 7;
  const startRadians = (referenceAngle * Math.PI) / 180;
  const endRadians = ((referenceAngle + rotation) * Math.PI) / 180;
  const start = {
    x: center.x + radius * Math.cos(startRadians),
    y: center.y - radius * Math.sin(startRadians),
  };
  const end = {
    x: center.x + radius * Math.cos(endRadians),
    y: center.y - radius * Math.sin(endRadians),
  };
  const sweep = rotation > 0 ? 0 : 1;
  return {
    center,
    path: `M ${start.x} ${start.y} A ${radius} ${radius} 0 0 ${sweep} ${end.x} ${end.y}`,
  };
}
