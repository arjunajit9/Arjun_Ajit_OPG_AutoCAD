import Link from "next/link";
export default function NotFound() { return <div className="shell empty-state"><h1>Page not found</h1><p>The page may have moved or the temporary analysis may have expired.</p><Link className="button button-primary" href="/">Return home</Link></div>; }
