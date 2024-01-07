const MINUTE_MILISECONDS = 60 * 1000;

const HOUR_MINUTES = 60;

const DAY_HOURS = 24;

export function milisendsToDuration(timestamp: number) {
  const minutes = timestamp / MINUTE_MILISECONDS;

  if (minutes < HOUR_MINUTES) {
    return minutes.toFixed(2) + " minutes";
  }

  const hours = minutes / HOUR_MINUTES;

  if (hours < DAY_HOURS) {
    return hours.toFixed(2) + " hours";
  }

  return (hours / DAY_HOURS).toFixed(2) + " days";
}
