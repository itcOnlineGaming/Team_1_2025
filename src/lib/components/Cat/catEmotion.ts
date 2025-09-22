import { Emotions } from "../../../types/Cat";

export function getEmotion(percentage: number, streak: number): Emotions {
  if (streak === 0) {
    return Emotions.Sad;
  } else if (percentage == 100) {
    return Emotions.Elated;
  } else if (percentage >= 75) {
    return Emotions.Happy;
  } else if (percentage >= 25) {
    return Emotions.Neutral;
  } else {
    return Emotions.Sad;
  }
}
