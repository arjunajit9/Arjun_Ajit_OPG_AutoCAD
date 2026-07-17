import type { OPGAnalysisInput, OPGAnalysisResult } from "./types";

export interface OPGAnalysisProvider {
  analyse(input: OPGAnalysisInput): Promise<OPGAnalysisResult>;
}
