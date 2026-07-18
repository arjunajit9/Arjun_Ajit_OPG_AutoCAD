import Link from "next/link";
import { ArrowRight, ScanLine } from "lucide-react";
import { THESIS_TOOL_NAME } from "@/features/opg-analysis/thesis-copy";

export default function HomePage() {
  return (
    <>
      <section className="hero home-hero">
        <div className="shell home-hero-grid">
          <div className="hero-content">
            <p className="home-hero-label">
              Arjun Ajit <span>/</span> Personal software
            </p>
            <h1>Arjun Ajit&apos;s Software Repository</h1>
            <p className="hero-copy">
              Applications, research tools, and digital experiments built from
              practical ideas.
            </p>
            <p className="hero-byline">Designed and developed by Arjun Ajit.</p>
          </div>
          <div className="home-hero-art" aria-hidden="true">
            <div className="home-orbit">
              <i className="orbit-dot orbit-dot-one" />
              <i className="orbit-dot orbit-dot-two" />
              <span>AA</span>
            </div>
            <div className="home-art-caption">
              <span>Independent software</span>
              <strong>2026 — ongoing</strong>
            </div>
          </div>
        </div>
      </section>
      <section id="projects" className="applications" aria-label="Projects">
        <div className="shell home-projects-inner">
          <div className="project-index" aria-hidden="true">
            <span>Selected project</span>
            <span>01 / 01</span>
          </div>
          <Link href="/opg-assistant" className="app-card">
            <span className="project-card-main">
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
                  A research-focused digital OPG assessment tool for
                  examiner-guided measurement of mandibular third molar
                  angulation and documentation for postgraduate research.
                </span>
              </span>
            </span>
            <span className="project-card-visual" aria-hidden="true">
              <span className="project-visual-label">
                Examiner-guided geometry
              </span>
              <svg viewBox="0 0 280 122">
                <path d="M18 78 Q140 116 262 78" className="visual-jaw-line" />
                <line x1="84" y1="96" x2="116" y2="24" />
                <line x1="143" y1="99" x2="143" y2="19" />
                <path
                  d="M143 67 A32 32 0 0 0 119 70"
                  className="visual-angle"
                />
                <circle cx="84" cy="96" r="4" />
                <circle cx="116" cy="24" r="4" />
                <circle cx="143" cy="99" r="4" />
                <circle cx="143" cy="19" r="4" />
              </svg>
              <span className="card-action">
                Open Project <ArrowRight size={17} />
              </span>
            </span>
          </Link>
        </div>
      </section>
    </>
  );
}
