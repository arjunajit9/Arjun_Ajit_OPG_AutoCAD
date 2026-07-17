import type { Metadata } from "next";
import { SiteHeader } from "@/components/layout/site-header";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "Arjun Ajit", template: "%s | Arjun Ajit" },
  description:
    "Personal software projects, research tools, experiments, and digital applications developed by Arjun Ajit.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <SiteHeader />
        <main>{children}</main>
        <footer className="site-footer">
          © 2026 Arjun Ajit. Personal software projects and experiments.
        </footer>
      </body>
    </html>
  );
}
