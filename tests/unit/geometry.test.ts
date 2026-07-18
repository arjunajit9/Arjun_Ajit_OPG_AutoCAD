import { describe, expect, it } from "vitest";
import {
  calculateGeometry,
  winterAngulationClassification,
  lineIntersection,
} from "@/features/opg-analysis/geometry";

describe("manual axis geometry", () => {
  it("calculates an acute angle and converts screen rotation to a signed anatomical Winter angle", () => {
    const result = calculateGeometry(
      [
        { x: 0, y: 0 },
        { x: 1, y: 0.577350269 },
        { x: 0, y: 0 },
        { x: 1, y: 0 },
      ],
      1,
      "48",
    );
    expect(result?.relativeAngleDegrees).toBe(30);
    expect(result?.signedRotationDegrees).toBe(30);
  });

  it("preserves a negative signed Winter angle for a distoangular result", () => {
    const result = calculateGeometry(
      [
        { x: 0, y: 0 },
        { x: 1, y: 0.577350269 },
        { x: 0, y: 0 },
        { x: 1, y: 0 },
      ],
      1,
      "38",
    );
    expect(result?.signedRotationDegrees).toBe(-30);
    expect(winterAngulationClassification("38", -30)).toBe("distoangular");
  });

  it("preserves the anatomical angle when the viewer is horizontally flipped", () => {
    const result = calculateGeometry(
      [
        { x: 1, y: 0 },
        { x: 0, y: 0.577350269 },
        { x: 1, y: 0 },
        { x: 0, y: 0 },
      ],
      1,
      "48",
      true,
    );
    expect(result?.signedRotationDegrees).toBe(30);
    expect(winterAngulationClassification("48", 30)).toBe("mesioangular");
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

  it("applies Winter ranges using the signed anatomical convention", () => {
    expect(winterAngulationClassification("38", 25)).toBe("mesioangular");
    expect(winterAngulationClassification("38", -25)).toBe("distoangular");
    expect(winterAngulationClassification("48", 25)).toBe("mesioangular");
    expect(winterAngulationClassification("48", -25)).toBe("distoangular");
    expect(winterAngulationClassification("38", 0.4)).toBe("vertical");
    expect(winterAngulationClassification("48", -0.4)).toBe("vertical");
    expect(winterAngulationClassification("48", 10)).toBe("vertical");
    expect(winterAngulationClassification("48", 10.1)).toBe("mesioangular");
    expect(winterAngulationClassification("48", 70.9)).toBe("mesioangular");
    expect(winterAngulationClassification("48", 71)).toBe("horizontal");
    expect(winterAngulationClassification("48", 110)).toBe("horizontal");
    expect(winterAngulationClassification("18", 25)).toBe("unable_to_assess");
  });
});
