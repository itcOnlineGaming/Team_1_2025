 export function progressBarColor(percentage: number): string {
    if (percentage < 50) {
      return 'red';
    } else if (percentage < 80) {
      return 'orange';
    } else {
      return 'green';
    }
  }