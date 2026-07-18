import { describe, expect, it } from "vitest";
import {
  displaySideForTooth,
  patientSideForDisplaySide,
  screenRotationToSignedWinterAngle,
  signedWinterAngleToScreenRotation,
  toothNumberForDisplaySide,
  toothNumberForNormalizedImageX,
} from "@/features/opg-analysis/laterality";

describe("standard panoramic OPG laterality", () => {
  it("maps image left to patient right and Tooth 48", () => {
    expect(patientSideForDisplaySide("left")).toBe("right");
    expect(toothNumberForDisplaySide("left")).toBe("48");
    expect(toothNumberForNormalizedImageX(0.2)).toBe("48");
  });

  it("maps image right to patient left and Tooth 38", () => {
    expect(patientSideForDisplaySide("right")).toBe("left");
    expect(toothNumberForDisplaySide("right")).toBe("38");
    expect(toothNumberForNormalizedImageX(0.8)).toBe("38");
  });

  it("tracks a horizontal viewer flip without changing anatomical identity", () => {
    expect(displaySideForTooth("48", true)).toBe("right");
    expect(displaySideForTooth("38", true)).toBe("left");
    expect(toothNumberForDisplaySide("left", true)).toBe("38");
    expect(toothNumberForDisplaySide("right", true)).toBe("48");
    expect(screenRotationToSignedWinterAngle("48", 30)).toBe(-30);
    expect(signedWinterAngleToScreenRotation("48", -30)).toBe(30);
    expect(screenRotationToSignedWinterAngle("48", 30, true)).toBe(30);
    expect(signedWinterAngleToScreenRotation("48", 30, true)).toBe(30);
  });
});
