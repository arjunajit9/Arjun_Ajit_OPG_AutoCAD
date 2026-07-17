import { describe, expect, it, vi } from "vitest";
import { analysisResultSchema } from "@/features/opg-analysis/schemas";
import { MockOPGAnalysisProvider } from "@/features/opg-analysis/providers/mock-provider";

describe("MockOPGAnalysisProvider", () => {
  it("returns a safe, schema-valid mock result with measurement provenance", async () => {
    vi.useFakeTimers();
    const promise = new MockOPGAnalysisProvider().analyse({ analysisId: "analysis-1", fileName: "study.png", mediaType: "image/png", fileSize: 1234 });
    await vi.runAllTimersAsync();
    const result = await promise;
    expect(analysisResultSchema.safeParse(result).success).toBe(true);
    expect(result.analysisMode).toBe("mock");
    expect(result.requiresSpecialistReview).toBe(true);
    expect(result.limitations.join(" ")).toContain("not derived");
    expect(result.findings.find((finding) => finding.angulation)?.angulation?.classificationMethod).toContain("not clinically validated");
    expect(result.findings).toHaveLength(2);
    expect(result.findings.map((finding) => finding.angulation?.toothNumber).sort()).toEqual(["38", "48"]);
    expect(result.findings.every((finding) => finding.angulation?.pericoronitisOutcome === "not_assessed_from_opg")).toBe(true);
    vi.useRealTimers();
  });
});
