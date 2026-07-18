"use client";

import { useEffect, useRef, useState } from "react";
import { BookOpen, CheckCircle2, MousePointer2, X } from "lucide-react";
import { Button } from "@/components/ui/button";

function GuideDiagram({ step }: { step: number }) {
  if (step === 1)
    return (
      <svg
        viewBox="0 0 240 120"
        role="img"
        aria-label="Panoramic image with mandibular third molar regions highlighted"
      >
        <rect width="240" height="120" rx="12" fill="#10201e" />
        <path
          d="M26 53 Q120 104 214 53"
          fill="none"
          stroke="#9fb5b0"
          strokeWidth="12"
          opacity=".65"
        />
        <path
          d="M34 48 Q120 3 206 48"
          fill="none"
          stroke="#849b96"
          strokeWidth="10"
          opacity=".5"
        />
        <rect
          x="22"
          y="59"
          width="35"
          height="42"
          rx="5"
          fill="none"
          stroke="#ffb73d"
          strokeWidth="3"
          strokeDasharray="5 4"
        />
        <rect
          x="183"
          y="59"
          width="35"
          height="42"
          rx="5"
          fill="none"
          stroke="#ffb73d"
          strokeWidth="3"
          strokeDasharray="5 4"
        />
        <text x="39" y="113" fill="#fff" fontSize="10" textAnchor="middle">
          48
        </text>
        <text x="201" y="113" fill="#fff" fontSize="10" textAnchor="middle">
          38
        </text>
        <text x="14" y="17" fill="#9ee6d7" fontSize="11" fontWeight="700">
          R
        </text>
        <text x="220" y="17" fill="#9ee6d7" fontSize="11" fontWeight="700">
          L
        </text>
      </svg>
    );
  if (step === 2)
    return (
      <svg
        viewBox="0 0 240 120"
        role="img"
        aria-label="Third molar selected and enlarged"
      >
        <rect width="240" height="120" rx="12" fill="#edf6f3" />
        <path
          d="M82 29 Q102 16 119 34 L126 61 Q125 81 113 103 L95 101 Q85 77 78 57Z"
          fill="#fff"
          stroke="#6d8882"
          strokeWidth="3"
          transform="rotate(-25 102 62)"
        />
        <path
          d="M136 23 Q157 15 172 29 L177 56 Q174 78 164 103 L145 103 Q137 76 133 53Z"
          fill="#fff"
          stroke="#6d8882"
          strokeWidth="3"
        />
        <rect
          x="64"
          y="10"
          width="76"
          height="101"
          rx="8"
          fill="none"
          stroke="#0c6b61"
          strokeWidth="3"
        />
        <circle cx="72" cy="18" r="7" fill="#0c6b61" />
        <path d="m69 18 2 2 4-5" fill="none" stroke="#fff" strokeWidth="2" />
      </svg>
    );
  if (step === 3)
    return (
      <svg
        viewBox="0 0 240 120"
        role="img"
        aria-label="Two orange points defining the third molar long axis from root to crown"
      >
        <rect width="240" height="120" rx="12" fill="#10201e" />
        <path
          d="M92 23 Q114 13 129 32 L137 56 Q133 82 118 107 L99 102 Q88 77 83 53Z"
          fill="#d5dfdc"
          stroke="#81938f"
          strokeWidth="2"
          transform="rotate(-28 110 63)"
        />
        <line
          x1="91"
          y1="92"
          x2="127"
          y2="27"
          stroke="#ffb73d"
          strokeWidth="4"
        />
        <circle
          cx="91"
          cy="92"
          r="7"
          fill="#ffb73d"
          stroke="#fff"
          strokeWidth="2"
        />
        <circle
          cx="127"
          cy="27"
          r="7"
          fill="#ffb73d"
          stroke="#fff"
          strokeWidth="2"
        />
        <text x="30" y="105" fill="#ffdd9b" fontSize="10">
          1. root
        </text>
        <text x="155" y="28" fill="#ffdd9b" fontSize="10">
          2. crown
        </text>
      </svg>
    );
  if (step === 4)
    return (
      <svg
        viewBox="0 0 240 120"
        role="img"
        aria-label="Blue adjacent second-molar long axis placed from root to crown"
      >
        <rect width="240" height="120" rx="12" fill="#10201e" />
        <path
          d="M62 25 Q83 16 97 31 L101 57 Q97 81 87 104 L69 103 Q61 78 58 54Z"
          fill="#d5dfdc"
          stroke="#81938f"
          strokeWidth="2"
        />
        <path
          d="M122 26 Q143 14 158 32 L164 58 Q159 83 148 106 L129 103 Q120 77 117 53Z"
          fill="#d5dfdc"
          stroke="#81938f"
          strokeWidth="2"
          transform="rotate(-27 141 65)"
        />
        <line
          x1="79"
          y1="101"
          x2="80"
          y2="26"
          stroke="#58c9ff"
          strokeWidth="4"
        />
        <circle
          cx="79"
          cy="101"
          r="7"
          fill="#58c9ff"
          stroke="#fff"
          strokeWidth="2"
        />
        <circle
          cx="80"
          cy="26"
          r="7"
          fill="#58c9ff"
          stroke="#fff"
          strokeWidth="2"
        />
        <text x="20" y="108" fill="#bceaff" fontSize="10">
          3. root
        </text>
        <text x="100" y="24" fill="#bceaff" fontSize="10">
          4. crown
        </text>
      </svg>
    );
  if (step === 5)
    return (
      <svg
        viewBox="0 0 240 120"
        role="img"
        aria-label="Angle formed between the tooth and reference axes"
      >
        <rect width="240" height="120" rx="12" fill="#f2f8f6" />
        <line
          x1="112"
          y1="99"
          x2="112"
          y2="18"
          stroke="#58aeda"
          strokeWidth="4"
        />
        <line
          x1="112"
          y1="99"
          x2="157"
          y2="25"
          stroke="#e79715"
          strokeWidth="4"
        />
        <path
          d="M112 64 A35 35 0 0 1 131 70"
          fill="none"
          stroke="#0c6b61"
          strokeWidth="3"
        />
        <text x="133" y="62" fill="#0c6b61" fontSize="16" fontWeight="700">
          θ
        </text>
        <text x="20" y="24" fill="#60726f" fontSize="10">
          signed anatomical Winter angle
        </text>
        <text x="20" y="42" fill="#132825" fontSize="12" fontWeight="700">
          + mesioangular · − distoangular
        </text>
      </svg>
    );
  return (
    <svg
      viewBox="0 0 240 120"
      role="img"
      aria-label="Clinician verification and separate clinical pericoronitis assessment"
    >
      <rect width="240" height="120" rx="12" fill="#edf6f3" />
      <rect
        x="25"
        y="20"
        width="88"
        height="82"
        rx="8"
        fill="#fff"
        stroke="#b8d2cc"
      />
      <path d="m40 42 7 7 13-17" fill="none" stroke="#1b9a68" strokeWidth="4" />
      <text x="67" y="45" fill="#132825" fontSize="10">
        Angle verified
      </text>
      <path d="m40 68 7 7 13-17" fill="none" stroke="#1b9a68" strokeWidth="4" />
      <text x="67" y="71" fill="#132825" fontSize="10">
        Class selected
      </text>
      <rect
        x="130"
        y="20"
        width="85"
        height="82"
        rx="8"
        fill="#fff8ea"
        stroke="#e1c684"
      />
      <text x="172" y="43" fill="#6b4b13" fontSize="10" textAnchor="middle">
        Clinical exam
      </text>
      <text x="172" y="62" fill="#6b4b13" fontSize="9" textAnchor="middle">
        Pericoronitis
      </text>
      <text x="172" y="78" fill="#6b4b13" fontSize="9" textAnchor="middle">
        recorded separately
      </text>
    </svg>
  );
}

const steps = [
  {
    title: "Prepare the study image",
    text: "Use a de-identified OPG with the mandibular third-molar regions visible. In standard panoramic orientation, image left / R is patient right (FDI 48), and image right / L is patient left (FDI 38).",
  },
  {
    title: "Select and enlarge the tooth",
    text: "Choose the anatomically labelled 48 or 38 finding card. Zoom and pan until the third molar and its adjacent second molar are clearly visible.",
  },
  {
    title: "Draw the tooth long axis",
    text: "Click Measure axes. Place point 1 at the third-molar root/apical end and point 2 at its crown/occlusal end. This consistent direction is required for the signed anatomical angle.",
  },
  {
    title: "Draw the adjacent second-molar axis",
    text: "Place point 3 at the adjacent mandibular second-molar root/apical end and point 4 at its crown/occlusal end. Winter's classification compares these two molar long axes.",
  },
  {
    title: "Review the on-image angle",
    text: "Both axes extend to their intersection. The arc remains on the image, while the result badge on the corresponding image side shows the signed Winter angle and classification.",
  },
  {
    title: "Confirm the suggestion",
    text: "The software applies the signed convention: Vertical from −10° to +10°, Mesioangular from +11° to +70°, Distoangular from −11° to −70°, and Horizontal from ±71° onward. Record pericoronitis separately from clinical examination.",
  },
];

export function MeasurementGuide({
  label = "Complete measurement guide",
}: {
  label?: string;
}) {
  const [open, setOpen] = useState(false);
  const closeRef = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    if (open) closeRef.current?.focus();
  }, [open]);
  return (
    <>
      <Button variant="secondary" type="button" onClick={() => setOpen(true)}>
        <BookOpen size={16} /> {label}
      </Button>
      {open && (
        <div
          className="guide-backdrop"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setOpen(false);
          }}
        >
          <section
            className="guide-dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby="measurement-guide-title"
          >
            <header className="guide-header">
              <div>
                <div className="eyebrow">Illustrated instructions</div>
                <h2 id="measurement-guide-title">
                  How to measure third-molar angulation
                </h2>
                <p>
                  {
                    "Winter's method compares the long axes of the mandibular third molar and adjacent second molar."
                  }
                </p>
              </div>
              <Button
                ref={closeRef}
                variant="ghost"
                onClick={() => setOpen(false)}
                aria-label="Close measurement guide"
              >
                <X />
              </Button>
            </header>
            <div className="guide-safety">
              <CheckCircle2 size={18} />
              <span>
                This tool performs geometry from examiner-placed points. It does
                not locate landmarks or diagnose pericoronitis automatically;
                the examiner must verify the calculated classification.
              </span>
            </div>
            <div className="guide-steps">
              {steps.map((item, index) => (
                <article className="guide-step" key={item.title}>
                  <GuideDiagram step={index + 1} />
                  <div className="guide-step-copy">
                    <span>Step {index + 1}</span>
                    <h3>{item.title}</h3>
                    <p>{item.text}</p>
                  </div>
                </article>
              ))}
            </div>
            <div className="guide-tips">
              <h3>
                <MousePointer2 size={18} /> Placement checklist
              </h3>
              <ul>
                <li>
                  Confirm the correct side and FDI tooth number before
                  measuring.
                </li>
                <li>
                  Use visible R/L markers when available: R identifies patient
                  right / tooth 48 and L identifies patient left / tooth 38.
                </li>
                <li>
                  Use the same endpoint orientation for every line so the signed
                  angle remains interpretable.
                </li>
                <li>
                  Repeat the measurement if landmarks are obscured or a point is
                  misplaced.
                </li>
                <li>
                  Mark the case “Unable to assess” when the protocol landmarks
                  cannot be identified reliably.
                </li>
                <li>
                  Document examiner training and inter-/intra-examiner
                  reliability in the thesis methodology.
                </li>
              </ul>
            </div>
            <footer className="guide-footer">
              <p>
                <strong>Protocol warning:</strong> the diagrams are
                instructional, not a substitute for your supervisor-approved
                measurement SOP.
              </p>
              <Button onClick={() => setOpen(false)}>I understand</Button>
            </footer>
          </section>
        </div>
      )}
    </>
  );
}
