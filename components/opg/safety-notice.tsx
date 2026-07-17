import { ShieldAlert } from "lucide-react";

export function SafetyNotice({ compact = false }: { compact?: boolean }) {
  return (
    <aside className={`safety-notice ${compact ? "compact" : ""}`} aria-label="Research safety notice">
      <ShieldAlert aria-hidden="true" />
      <div><strong>Research prototype — not for autonomous diagnosis or treatment decisions.</strong>{!compact && " This thesis interface classifies mandibular third-molar angulation only. Pericoronitis requires clinical assessment by a qualified professional."}</div>
    </aside>
  );
}
