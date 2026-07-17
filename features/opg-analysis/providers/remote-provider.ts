import type { OPGAnalysisProvider } from "../provider";
import type { OPGAnalysisResult } from "../types";

export class RemoteMedicalModelProvider implements OPGAnalysisProvider {
  analyse(): Promise<OPGAnalysisResult> {
    throw new Error("Remote medical-model analysis is not configured in this research prototype.");
  }
}
