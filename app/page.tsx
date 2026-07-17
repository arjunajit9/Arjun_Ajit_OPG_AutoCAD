import Link from "next/link";
import { ArrowRight, ScanLine } from "lucide-react";
import { THESIS_TOOL_NAME } from "@/features/opg-analysis/thesis-copy";

export default function HomePage() {
  return (
    <>
      <section className="hero shell">
        <div className="hero-content">
          <div className="eyebrow">Arjun Ajit · Personal Software Projects</div>
          <h2>Building software that solves real problems.</h2>
          <p className="hero-copy">
            A curated collection of applications, research tools, and digital
            experiments developed to transform practical ideas into useful
            software.
          </p>
          <p className="hero-byline">Designed and developed by Arjun Ajit.</p>
        </div>
      </section>
      <section
        id="projects"
        className="shell applications"
        aria-labelledby="projects-title"
      >
        <div className="section-heading">
          <div className="eyebrow">Projects</div>
          <h3 id="projects-title">Current Project</h3>
         
        </div>
        <Link href="/opg-assistant" className="app-card">
          <span className="app-icon">
            <ScanLine />
          </span>
          <span className="project-card-content">
            <span className="project-card-meta">
              <span className="app-kicker">Dental Research Tool</span>
              <span className="status-pill">Prototype</span>
            </span>
            <strong>{THESIS_TOOL_NAME}</strong>
            <span className="app-description">
              A research-focused digital OPG assessment tool for examiner-guided
              measurement of mandibular third molar angulation and documentation
              for postgraduate research.
            </span>
          </span>
          <span className="card-action">
            Open Project <ArrowRight size={17} />
          </span>
        </Link>
      </section>
    </>
  );
}
