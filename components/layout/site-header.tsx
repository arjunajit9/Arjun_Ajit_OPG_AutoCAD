import Link from "next/link";
import { Stethoscope } from "lucide-react";

export function SiteHeader() {
  return (
    <header className="site-header">
      <Link href="/" className="brand" aria-label="Arjun Ajit home">
        <span className="brand-mark">AA</span><span>Arjun Ajit</span>
      </Link>
      <nav aria-label="Primary navigation">
        <Link href="/opg-assistant" className="nav-link"><Stethoscope size={17} /> OPG Assistant</Link>
      </nav>
    </header>
  );
}
