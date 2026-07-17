import type { Metadata } from "next";
import { SiteHeader } from "@/components/layout/site-header";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "Arjun Ajit", template: "%s | Arjun Ajit" },
  description: "Personal website and research application workspace for Arjun Ajit.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body><SiteHeader /><main>{children}</main><footer className="site-footer">© {new Date().getFullYear()} Arjun Ajit · Built with care and clinical caution.</footer></body></html>;
}
