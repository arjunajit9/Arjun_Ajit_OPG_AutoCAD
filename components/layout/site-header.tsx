import Link from "next/link";

export function SiteHeader() {
  return (
    <header className="site-header">
      <Link href="/" className="brand" aria-label="Home">
        <span className="brand-mark">AA</span>
        <span>Home</span>
      </Link>
      <nav aria-label="Primary navigation">
        <Link href="/#projects" className="nav-link">
          Projects
        </Link>
      </nav>
    </header>
  );
}
