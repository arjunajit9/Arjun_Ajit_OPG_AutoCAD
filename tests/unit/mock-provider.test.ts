import { describe, expect, it, vi } from "vitest";
import { analysisResultSchema } from "@/features/opg-analysis/schemas";
import { MockOPGAnalysisProvider } from "@/features/opg-analysis/providers/mock-provider";

describe("MockOPGAnalysisProvider", () => {
  it("returns safe, unmeasured bilateral records for examiner geometry", async () => {
    vi.useFakeTimers();
    const promise = new MockOPGAnalysisProvider().analyse({
      analysisId: "analysis-1",
      fileName: "study.png",
      mediaType: "image/png",
      fileSize: 1234,
    });
    await vi.runAllTimersAsync();
    const result = await promise;
    expect(analysisResultSchema.safeParse(result).success).toBe(true);
    expect(result.analysisMode).toBe("research");
    expect(result.requiresSpecialistReview).toBe(true);
    expect(result.limitations.join(" ")).toContain("four axis points");
    expect(
      result.findings.every(
        (finding) =>
          finding.angulation?.measurementSource === "unmeasured" &&
          finding.angulation.classification === "unable_to_assess",
      ),
    ).toBe(true);
    expect(result.findings).toHaveLength(2);
    expect(
      result.findings.map((finding) => finding.angulation?.toothNumber).sort(),
    ).toEqual(["38", "48"]);
    expect(
      result.findings.every(
        (finding) =>
          finding.angulation?.pericoronitisOutcome === "not_assessed_from_opg",
      ),
    ).toBe(true);
    vi.useRealTimers();
  });
});
