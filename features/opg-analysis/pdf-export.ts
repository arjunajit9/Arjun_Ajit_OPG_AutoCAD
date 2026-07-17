import {
  PDFDocument,
  StandardFonts,
  rgb,
  type PDFFont,
  type PDFPage,
} from "pdf-lib";
import { extendLine, lineIntersection } from "./geometry";
import type { OPGFinding, TemporaryStudy } from "./types";
import {
  THESIS_DEPARTMENT,
  THESIS_INSTITUTION,
  THESIS_PRESENTER,
  THESIS_PRESENTER_ROLE,
  THESIS_TITLE,
  WINTER_THRESHOLD_SUMMARY,
} from "./thesis-copy";

const PAGE_WIDTH = 841.89;
const PAGE_HEIGHT = 595.28;

function ascii(value: string): string {
  return value
    .replaceAll("°", " deg")
    .replaceAll("≤", "<=")
    .replaceAll("–", "-")
    .replaceAll("—", "-")
    .replaceAll("·", "|")
    .replaceAll("±", "+/-")
    .replaceAll(/[\u0080-\uFFFF]/g, "");
}

function wrapText(text: string, font: PDFFont, size: number, width: number) {
  const words = ascii(text).split(/\s+/);
  const lines: string[] = [];
  let line = "";
  for (const word of words) {
    const next = line ? `${line} ${word}` : word;
    if (font.widthOfTextAtSize(next, size) <= width) line = next;
    else {
      if (line) lines.push(line);
      line = word;
    }
  }
  if (line) lines.push(line);
  return lines;
}

function drawWrappedText(
  page: PDFPage,
  text: string,
  options: {
    x: number;
    y: number;
    width: number;
    size: number;
    lineHeight: number;
    font: PDFFont;
    color?: ReturnType<typeof rgb>;
  },
) {
  const lines = wrapText(text, options.font, options.size, options.width);
  lines.forEach((line, index) =>
    page.drawText(line, {
      x: options.x,
      y: options.y - index * options.lineHeight,
      size: options.size,
      font: options.font,
      color: options.color,
    }),
  );
  return options.y - lines.length * options.lineHeight;
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

export async function createAnnotatedRadiographPng(
  imageBlob: Blob,
  findings: OPGFinding[],
): Promise<Blob> {
  const bitmap = await createImageBitmap(imageBlob);
  const scale = Math.min(1, 1800 / bitmap.width);
  const width = Math.round(bitmap.width * scale);
  const height = Math.round(bitmap.height * scale);
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext("2d");
  if (!context) throw new Error("Canvas rendering is unavailable.");
  context.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();

  const lineWidth = Math.max(3, width / 500);
  const measured = findings.filter(
    (finding) =>
      finding.angulation?.measurementSource === "clinician_geometry" &&
      finding.angulation.toothAxis &&
      finding.angulation.referenceAxis,
  );
  for (const finding of measured) {
    const angle = finding.angulation!;
    const toothAxis = angle.toothAxis!;
    const referenceAxis = angle.referenceAxis!;
    const drawAxis = (
      axis: typeof toothAxis,
      color: string,
      dashed: boolean,
    ) => {
      const extended = extendLine(axis);
      context.save();
      context.strokeStyle = color;
      context.lineWidth = lineWidth;
      context.setLineDash(dashed ? [lineWidth * 2.2, lineWidth * 1.4] : []);
      context.beginPath();
      context.moveTo(extended[0].x * width, extended[0].y * height);
      context.lineTo(extended[1].x * width, extended[1].y * height);
      context.stroke();
      context.restore();
    };
    drawAxis(toothAxis, "#ffb73d", false);
    drawAxis(referenceAxis, "#58c9ff", true);

    const intersection = lineIntersection(toothAxis, referenceAxis);
    if (intersection) {
      const centerX = intersection.x * width;
      const centerY = intersection.y * height;
      const referenceRadians = Math.atan2(
        (referenceAxis[1].y - referenceAxis[0].y) * height,
        (referenceAxis[1].x - referenceAxis[0].x) * width,
      );
      const toothRadians = Math.atan2(
        (toothAxis[1].y - toothAxis[0].y) * height,
        (toothAxis[1].x - toothAxis[0].x) * width,
      );
      let difference = toothRadians - referenceRadians;
      while (difference > Math.PI) difference -= Math.PI * 2;
      while (difference < -Math.PI) difference += Math.PI * 2;
      context.save();
      context.strokeStyle = "#ffda76";
      context.lineWidth = lineWidth;
      context.beginPath();
      context.arc(
        centerX,
        centerY,
        Math.max(24, width * 0.035),
        referenceRadians,
        referenceRadians + difference,
        difference < 0,
      );
      context.stroke();
      context.restore();
    }

    const badgeWidth = Math.max(190, width * 0.2);
    const badgeHeight = Math.max(64, width * 0.065);
    const badgeX = angle.toothNumber === "38" ? 18 : width - badgeWidth - 18;
    const badgeY = 18;
    context.save();
    context.fillStyle = "rgba(8,34,31,.94)";
    context.strokeStyle = "#ffda76";
    context.lineWidth = Math.max(2, lineWidth / 2);
    context.beginPath();
    context.roundRect(badgeX, badgeY, badgeWidth, badgeHeight, 12);
    context.fill();
    context.stroke();
    context.fillStyle = "#ffffff";
    context.font = `700 ${Math.max(18, width * 0.02)}px Arial`;
    context.textAlign = angle.toothNumber === "38" ? "left" : "right";
    const textX =
      angle.toothNumber === "38" ? badgeX + 14 : badgeX + badgeWidth - 14;
    context.fillText(
      `Tooth ${angle.toothNumber}: ${angle.relativeAngleDegrees}°`,
      textX,
      badgeY + badgeHeight * 0.48,
    );
    context.fillStyle = "#b9d8d2";
    context.font = `600 ${Math.max(12, width * 0.012)}px Arial`;
    context.fillText(
      `Winter: ${angle.classification.replaceAll("_", " ")}`,
      textX,
      badgeY + badgeHeight * 0.78,
    );
    context.restore();
  }

  return new Promise((resolve, reject) =>
    canvas.toBlob(
      (blob) =>
        blob ? resolve(blob) : reject(new Error("PNG export failed.")),
      "image/png",
    ),
  );
}

function drawResultCard(
  page: PDFPage,
  finding: OPGFinding | undefined,
  toothNumber: string,
  x: number,
  y: number,
  width: number,
  regular: PDFFont,
  bold: PDFFont,
) {
  page.drawRectangle({
    x,
    y,
    width,
    height: 82,
    color: rgb(0.95, 0.98, 0.97),
    borderColor: rgb(0.74, 0.84, 0.81),
    borderWidth: 1,
  });
  page.drawText(`TOOTH ${toothNumber}`, {
    x: x + 14,
    y: y + 59,
    size: 9,
    font: bold,
    color: rgb(0.04, 0.42, 0.37),
  });
  const angle = finding?.angulation;
  page.drawText(
    angle
      ? `${ascii(angle.classification.replaceAll("_", " ")).toUpperCase()} | ${angle.relativeAngleDegrees ?? "-"} deg`
      : "NOT MEASURED",
    {
      x: x + 14,
      y: y + 37,
      size: 15,
      font: bold,
      color: rgb(0.07, 0.18, 0.16),
    },
  );
  page.drawText(
    angle?.studyEligibleClassification
      ? "Position category recorded for study"
      : "Measurement incomplete",
    {
      x: x + 14,
      y: y + 17,
      size: 8.5,
      font: regular,
      color: rgb(0.31, 0.4, 0.38),
    },
  );
}

export async function createStudyPdf(study: TemporaryStudy): Promise<Blob> {
  if (!study.result) throw new Error("Analysis result is unavailable.");
  const pdf = await PDFDocument.create();
  const regular = await pdf.embedFont(StandardFonts.Helvetica);
  const bold = await pdf.embedFont(StandardFonts.HelveticaBold);
  const annotatedBlob = await createAnnotatedRadiographPng(
    study.image,
    study.result.findings,
  );
  const annotatedImage = await pdf.embedPng(await annotatedBlob.arrayBuffer());
  const page = pdf.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
  page.drawRectangle({
    x: 0,
    y: PAGE_HEIGHT - 68,
    width: PAGE_WIDTH,
    height: 68,
    color: rgb(0.03, 0.22, 0.2),
  });
  page.drawText("MANDIBULAR THIRD MOLAR ANGULATION RESULTS", {
    x: 31,
    y: PAGE_HEIGHT - 33,
    size: 18,
    font: bold,
    color: rgb(1, 1, 1),
  });
  page.drawText(ascii(THESIS_TITLE), {
    x: 31,
    y: PAGE_HEIGHT - 51,
    size: 7.5,
    font: regular,
    color: rgb(0.72, 0.86, 0.83),
  });
  page.drawText(ascii(`${THESIS_PRESENTER} | ${THESIS_PRESENTER_ROLE}`), {
    x: 590,
    y: PAGE_HEIGHT - 33,
    size: 7.5,
    font: regular,
    color: rgb(0.86, 0.94, 0.92),
  });
  const metadata = `Study: ${ascii(study.studyReference || "Anonymous")} | Generated: ${new Date().toLocaleString()} | OPG suitability: examiner check required`;
  page.drawText(metadata, {
    x: 31,
    y: PAGE_HEIGHT - 88,
    size: 8.5,
    font: regular,
    color: rgb(0.31, 0.4, 0.38),
  });
  const imageScale = Math.min(
    760 / annotatedImage.width,
    326 / annotatedImage.height,
  );
  const imageWidth = annotatedImage.width * imageScale;
  const imageHeight = annotatedImage.height * imageScale;
  const imageX = (PAGE_WIDTH - imageWidth) / 2;
  const imageY = 151 + (326 - imageHeight) / 2;
  page.drawRectangle({
    x: imageX - 4,
    y: imageY - 4,
    width: imageWidth + 8,
    height: imageHeight + 8,
    color: rgb(0.05, 0.08, 0.08),
  });
  page.drawImage(annotatedImage, {
    x: imageX,
    y: imageY,
    width: imageWidth,
    height: imageHeight,
  });
  page.drawText(
    "Orange: third-molar long axis   Blue dashed: adjacent second-molar long axis",
    {
      x: 31,
      y: 137,
      size: 8,
      font: regular,
      color: rgb(0.31, 0.4, 0.38),
    },
  );
  drawResultCard(
    page,
    measuredFinding(study.result.findings, "38"),
    "38 - LEFT",
    31,
    43,
    376,
    regular,
    bold,
  );
  drawResultCard(
    page,
    measuredFinding(study.result.findings, "48"),
    "48 - RIGHT",
    435,
    43,
    376,
    regular,
    bold,
  );
  page.drawText(
    "For MDS thesis presentation demonstration only - examiner verification required.",
    {
      x: 31,
      y: 18,
      size: 7.5,
      font: regular,
      color: rgb(0.39, 0.45, 0.44),
    },
  );
  page.drawText("Page 1 of 2", { x: 758, y: 18, size: 7.5, font: regular });

  const detail = pdf.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
  detail.drawText("MEASUREMENT DETAILS", {
    x: 31,
    y: PAGE_HEIGHT - 42,
    size: 18,
    font: bold,
    color: rgb(0.03, 0.22, 0.2),
  });
  detail.drawText(
    ascii(`${THESIS_PRESENTER} | ${THESIS_DEPARTMENT} | ${THESIS_INSTITUTION}`),
    {
      x: 31,
      y: PAGE_HEIGHT - 59,
      size: 8,
      font: regular,
      color: rgb(0.31, 0.4, 0.38),
    },
  );
  ["38", "48"].forEach((toothNumber, index) => {
    const finding = measuredFinding(study.result!.findings, toothNumber);
    const angle = finding?.angulation;
    const x = index === 0 ? 31 : 435;
    detail.drawRectangle({
      x,
      y: 318,
      width: 376,
      height: 190,
      color: rgb(0.98, 0.99, 0.99),
      borderColor: rgb(0.82, 0.87, 0.86),
      borderWidth: 1,
    });
    detail.drawText(
      `TOOTH ${toothNumber} - ${toothNumber === "38" ? "LEFT" : "RIGHT"}`,
      {
        x: x + 15,
        y: 483,
        size: 12,
        font: bold,
        color: rgb(0.04, 0.42, 0.37),
      },
    );
    const rows = angle
      ? [
          ["Winter result", angle.classification.replaceAll("_", " ")],
          ["Acute relative angle", `${angle.relativeAngleDegrees ?? "-"} deg`],
          ["Third-molar axis", `${angle.toothLongAxisDegrees ?? "-"} deg`],
          ["Second-molar axis", `${angle.referenceAxisDegrees ?? "-"} deg`],
          ["Signed rotation", `${angle.signedRotationDegrees ?? "-"} deg`],
          [
            "Study position category",
            angle.studyEligibleClassification ? "Recorded" : "Incomplete",
          ],
          ["Examiner status", examinerStatus(finding)],
        ]
      : [["Status", "Manual measurement not completed"]];
    rows.forEach(([label, value], rowIndex) => {
      const y = 457 - rowIndex * 21;
      detail.drawText(ascii(label), {
        x: x + 15,
        y,
        size: 8,
        font: regular,
        color: rgb(0.39, 0.45, 0.44),
      });
      detail.drawText(ascii(value), {
        x: x + 155,
        y,
        size: 8.5,
        font: bold,
        color: rgb(0.07, 0.18, 0.16),
      });
    });
  });
  detail.drawText("METHOD", {
    x: 31,
    y: 284,
    size: 11,
    font: bold,
    color: rgb(0.03, 0.22, 0.2),
  });
  drawWrappedText(
    detail,
    `Winter classification is calculated from the angle between the examiner-positioned long axes of the mandibular third molar and adjacent second molar. ${WINTER_THRESHOLD_SUMMARY} Pericoronitis must be recorded separately using the defined clinical examination criteria.`,
    {
      x: 31,
      y: 266,
      width: 780,
      size: 9,
      lineHeight: 13,
      font: regular,
      color: rgb(0.2, 0.28, 0.27),
    },
  );
  detail.drawText("PRESENTATION NOTES", {
    x: 31,
    y: 195,
    size: 11,
    font: bold,
    color: rgb(0.03, 0.22, 0.2),
  });
  drawWrappedText(
    detail,
    study.comments.trim() || "No presentation notes entered.",
    {
      x: 31,
      y: 177,
      width: 780,
      size: 9,
      lineHeight: 13,
      font: regular,
      color: rgb(0.2, 0.28, 0.27),
    },
  );
  detail.drawRectangle({
    x: 31,
    y: 49,
    width: 780,
    height: 67,
    color: rgb(1, 0.97, 0.89),
    borderColor: rgb(0.88, 0.75, 0.44),
    borderWidth: 1,
  });
  detail.drawText("IMPORTANT LIMITATION", {
    x: 45,
    y: 94,
    size: 9,
    font: bold,
    color: rgb(0.43, 0.3, 0.07),
  });
  drawWrappedText(
    detail,
    "The axes and classifications require examiner confirmation. This is a thesis-presentation measurement aid; angulation does not diagnose pericoronitis or determine treatment.",
    {
      x: 45,
      y: 78,
      width: 750,
      size: 8.5,
      lineHeight: 12,
      font: regular,
      color: rgb(0.43, 0.3, 0.07),
    },
  );
  detail.drawText("Page 2 of 2", { x: 758, y: 18, size: 7.5, font: regular });

  const bytes = await pdf.save();
  const buffer = new ArrayBuffer(bytes.byteLength);
  new Uint8Array(buffer).set(bytes);
  return new Blob([buffer], { type: "application/pdf" });
}

export async function downloadStudyPdf(study: TemporaryStudy) {
  const blob = await createStudyPdf(study);
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  const safeReference = (study.studyReference || study.id)
    .replace(/[^a-z0-9_-]+/gi, "-")
    .replace(/^-+|-+$/g, "");
  anchor.href = url;
  anchor.download = `third-molar-angulation-${safeReference || "study"}.pdf`;
  document.body.append(anchor);
  anchor.click();
  anchor.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}
