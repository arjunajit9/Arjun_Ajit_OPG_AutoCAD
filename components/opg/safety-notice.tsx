import { ShieldAlert } from "lucide-react";

export function SafetyNotice({ compact = false }: { compact?: boolean }) {
  return (
    <aside
      className={`safety-notice ${compact ? "compact" : ""}`}
      aria-label="Research safety notice"
    >
      <ShieldAlert aria-hidden="true" />
      <div>
        <strong>
          MDS thesis presentation tool — not for diagnosis or treatment
          decisions.
        </strong>
        {!compact &&
          " This examiner-guided interface measures mandibular third-molar angulation only. Pericoronitis requires separate clinical assessment by a qualified professional."}
      </div>
    </aside>
  );
}
