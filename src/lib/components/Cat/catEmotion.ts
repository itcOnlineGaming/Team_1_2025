import { Emotions } from "../../../types/Cat";

export function getEmotion(percentage: number, streak: number): Emotions {
  if (streak === 0) {
    return Emotions.Sad;
  } else if (percentage >= 80) {
    return Emotions.Happy;
  } else if (percentage >= 50) {
    return Emotions.Neutral;
  } else {
    return Emotions.Sad;
  }
}
