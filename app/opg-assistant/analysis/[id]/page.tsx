import type { Metadata } from "next";
import { AnalysisWorkspace } from "@/components/opg/analysis-workspace";

export const metadata: Metadata = { title: "OPG Angulation Results" };

export default async function AnalysisPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <AnalysisWorkspace analysisId={id} />;
}
