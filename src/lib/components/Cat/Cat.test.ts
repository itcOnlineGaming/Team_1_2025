import { describe, it, expect } from "vitest";
import { getEmotion } from "./catEmotion";
import { Emotions } from "../../../types/Cat";

describe("getEmotion function", () => {
  it("returns Sad if streak is 0", () => {
    expect(getEmotion(100, 0)).toBe(Emotions.Sad);
    expect(getEmotion(30, 0)).toBe(Emotions.Sad);
  });

  it("returns Elated if all words written and streak > 0", () => {
    expect(getEmotion(100, 1)).toBe(Emotions.Elated);
    expect(getEmotion(100, 10)).toBe(Emotions.Elated);
  });
  it("returns Happy if percentage >= 80 and streak > 0", () => {
    expect(getEmotion(80, 1)).toBe(Emotions.Happy);
    expect(getEmotion(90, 5)).toBe(Emotions.Happy);
  });

  it("returns Neutral if percentage >= 25 and < 75 and streak > 0", () => {
    expect(getEmotion(50, 1)).toBe(Emotions.Neutral);
    expect(getEmotion(74, 2)).toBe(Emotions.Neutral);
  });

  it("returns Sad if percentage < 25 and streak > 0", () => {
    expect(getEmotion(20, 1)).toBe(Emotions.Sad);
    expect(getEmotion(0, 3)).toBe(Emotions.Sad);
  });
});
