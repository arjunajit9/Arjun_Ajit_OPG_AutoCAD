import Link from "next/link";
import { ArrowRight, ScanLine, ShieldCheck } from "lucide-react";

export default function HomePage() {
  return (
    <>
      <section className="hero shell">
        <div className="eyebrow">Personal workspace · Digital experiments</div>
        <h1>Thoughtful software for meaningful work.</h1>
        <p className="hero-copy">I’m Arjun Ajit. This is my home for carefully designed applications, technical projects, and ideas built to solve real problems.</p>
        <div className="hero-meta"><span><ShieldCheck size={18} /> Privacy-conscious</span><span>Research-led design</span></div>
      </section>
      <section className="shell applications" aria-labelledby="apps-title">
        <div className="section-heading"><div><div className="eyebrow">Applications</div><h2 id="apps-title">Explore the workspace</h2></div><p>Purpose-built tools with clear boundaries and transparent behavior.</p></div>
        <Link href="/opg-assistant" className="app-card">
          <span className="app-icon"><ScanLine /></span>
          <span className="status-pill"><i /> Prototype</span>
          <span><span className="app-kicker">Cross-sectional thesis interface</span><strong>Mandibular Third Molar Study Assistant</strong><span className="app-description">Compare mesioangular and distoangular impactions of teeth 38 and 48 as risk indicators for clinically assessed pericoronitis.</span></span>
          <span className="card-action">Open application <ArrowRight size={18} /></span>
        </Link>
      </section>
    </>
  );
}
