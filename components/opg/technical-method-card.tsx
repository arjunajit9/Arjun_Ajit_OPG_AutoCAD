import { Ruler } from "lucide-react";
import { MeasurementGuide } from "./measurement-guide";

export function TechnicalMethodCard() {
  return (
    <aside
      className="technical-method-card"
      aria-labelledby="technical-method-title"
    >
      <div className="technical-method-icon" aria-hidden="true">
        <Ruler size={22} strokeWidth={1.8} />
      </div>
      <div className="technical-method-copy">
        <h2 id="technical-method-title">Technical Method</h2>
        <p>
          This tool uses examiner-guided deterministic 2D analytical geometry.
          The Winter angle is calculated from examiner-marked landmark
          coordinates with image aspect-ratio correction, using the same general
          mathematical principles as angle-measurement tools in{" "}
          <strong>AutoCAD</strong> and <strong>ImageJ</strong>.
        </p>
      </div>
      <div className="technical-method-action">
        <MeasurementGuide label="How it works" />
      </div>
    </aside>
  );
}
