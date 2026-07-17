import Link from "next/link";

export function SiteHeader() {
  return (
    <header className="site-header">
      <Link href="/" className="brand" aria-label="Arjun Ajit home">
        <span className="brand-mark">AA</span>
        <span>Arjun Ajit</span>
      </Link>
      <nav aria-label="Primary navigation">
        <Link href="/#projects" className="nav-link">
          Projects
        </Link>
      </nav>
    </header>
  );
}
