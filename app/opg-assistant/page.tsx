import type { Metadata } from "next";
import { UploadWorkflow } from "@/components/opg/upload-workflow";
import { SafetyNotice } from "@/components/opg/safety-notice";
import { MeasurementGuide } from "@/components/opg/measurement-guide";
import {
  THESIS_DEPARTMENT,
  THESIS_INSTITUTION,
  THESIS_PRESENTER,
  THESIS_PRESENTER_ROLE,
  THESIS_TITLE,
} from "@/features/opg-analysis/thesis-copy";

export const metadata: Metadata = { title: "Lakshmi Thesis OPG Tool" };

export default function OPGAssistantPage() {
  return (
    <div className="shell app-shell">
      <div className="app-intro">
        <div>
          <div className="eyebrow">
            MDS thesis presentation · OPG measurement demonstration
          </div>
          <h1>Digital Measurement of Mandibular Third Molar Angulation</h1>
          <p className="research-title">{THESIS_TITLE}</p>
          <div className="academic-author" aria-label="Research author">
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
        </div>
        <span className="mode-badge">Presentation demo</span>
      </div>
      <SafetyNotice />
      <div className="guide-launch">
        <div>
          <strong>New to geometric measurement?</strong>
          <span>See every step before uploading a study image.</span>
        </div>
        <MeasurementGuide />
      </div>
      <UploadWorkflow />
    </div>
  );
}
