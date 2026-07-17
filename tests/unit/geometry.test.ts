import { describe, expect, it } from "vitest";
import {
  calculateGeometry,
  winterAngulationClassification,
  lineIntersection,
} from "@/features/opg-analysis/geometry";

describe("manual axis geometry", () => {
  it("calculates an acute angle and preserves signed rotation", () => {
    const result = calculateGeometry([
      { x: 0, y: 0 },
      { x: 1, y: 0.577350269 },
      { x: 0, y: 0 },
      { x: 1, y: 0 },
    ]);
    expect(result?.relativeAngleDegrees).toBe(30);
    expect(result?.signedRotationDegrees).toBe(-30);
  });

  it("uses the acute intersection angle", () => {
    const result = calculateGeometry([
      { x: 1, y: 0 },
      { x: 0, y: 1 },
      { x: 0, y: 0 },
      { x: 1, y: 0 },
    ]);
    expect(result?.relativeAngleDegrees).toBe(45);
  });

  it("requires four measurement points", () => {
    expect(calculateGeometry([{ x: 0, y: 0 }])).toBeUndefined();
  });

  it("finds the point where the extended axes meet", () => {
    expect(
      lineIntersection(
        [
          { x: 0, y: 0 },
          { x: 1, y: 1 },
        ],
        [
          { x: 0, y: 1 },
          { x: 1, y: 0 },
        ],
      ),
    ).toEqual({ x: 0.5, y: 0.5 });
  });

  it("applies Winter ranges and maps direction according to mandibular side", () => {
    expect(winterAngulationClassification("38", -25)).toBe("mesioangular");
    expect(winterAngulationClassification("38", 25)).toBe("distoangular");
    expect(winterAngulationClassification("48", 25)).toBe("mesioangular");
    expect(winterAngulationClassification("48", -25)).toBe("distoangular");
    expect(winterAngulationClassification("48", 10)).toBe("vertical");
    expect(winterAngulationClassification("48", 80)).toBe("horizontal");
    expect(winterAngulationClassification("48", 110)).toBe("other");
    expect(winterAngulationClassification("18", 25)).toBe("unable_to_assess");
  });
});
