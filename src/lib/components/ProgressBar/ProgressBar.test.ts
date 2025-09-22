import { describe, it, expect } from "vitest";
import { progressBarColor } from "./getProgressColour";

describe("progressBarColor function", () => {
  it("returns red for percentage less than 50", () => {
    expect(progressBarColor(0)).toBe("red");
    expect(progressBarColor(25)).toBe("red");
    expect(progressBarColor(49)).toBe("red");
      });
    });
      

