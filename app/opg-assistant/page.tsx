import type { Metadata } from "next";
import { UploadWorkflow } from "@/components/opg/upload-workflow";
import { SafetyNotice } from "@/components/opg/safety-notice";
import { MeasurementGuide } from "@/components/opg/measurement-guide";

export const metadata: Metadata = { title: "Maxillofacial OPG Assistant" };

export default function OPGAssistantPage() {
  return (
    <div className="shell app-shell">
      <div className="app-intro"><div><div className="eyebrow">Cross-sectional thesis workspace · Mock analysis</div><h1>Mandibular Third Molar Study Assistant</h1><p>Review mandibular third molars (FDI 38 and 48) for mesioangular or distoangular impaction classification. Pericoronitis must be assessed clinically and is not diagnosed from the OPG.</p></div><span className="mode-badge">Thesis mock mode</span></div>
      <SafetyNotice />
      <div className="guide-launch"><div><strong>New to geometric measurement?</strong><span>See every step before uploading a study image.</span></div><MeasurementGuide /></div>
      <UploadWorkflow />
    </div>
  );
}
