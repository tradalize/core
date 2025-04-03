import { type Timeframe, TIMEFRAME } from "../exchangeClients/types.js";

const HOUR_MINUTES = 60;
const DAY_HOURS = 24;

const MINUTE_MILLISECONDS = 60 * 1000;
const HOUR_MILLISECONDS = HOUR_MINUTES * MINUTE_MILLISECONDS;
const DAY_MILLISECONDS = DAY_HOURS * HOUR_MILLISECONDS;

export function milisendsToDuration(diffInMiliseconds?: number): string {
  if (!diffInMiliseconds || diffInMiliseconds === 0) {
    return "-";
  }

  const totalMinutes = Math.floor(diffInMiliseconds / MINUTE_MILLISECONDS);
  const totalHours = Math.floor(totalMinutes / HOUR_MINUTES);
  const totalDays = Math.floor(totalHours / DAY_HOURS);

  const minutes = totalMinutes % HOUR_MINUTES;
  const hours = totalHours % DAY_HOURS;

  if (totalHours < 1) {
    return `${minutes}m`;
  }

  if (totalDays < 1) {
    return `${hours}h ${minutes}m`;
  }

  return `${totalDays}d ${hours}h ${minutes}m`;
}

export type TimeframeTree = {
  timeframe: Timeframe;
  time: number;
  children?: TimeframeTree[];
};

const timeframeMilliseconds: Record<Timeframe, number> = Object.freeze({
  [TIMEFRAME.OneMinute]: MINUTE_MILLISECONDS,
  [TIMEFRAME.FiveMinutes]: 5 * MINUTE_MILLISECONDS,
  [TIMEFRAME.FifteenMinutes]: 15 * MINUTE_MILLISECONDS,
  [TIMEFRAME.OneHour]: HOUR_MILLISECONDS,
  [TIMEFRAME.FourHours]: 4 * HOUR_MILLISECONDS,
  [TIMEFRAME.OneDay]: DAY_MILLISECONDS,
  [TIMEFRAME.OneWeek]: 7 * DAY_MILLISECONDS,
});

function createTree(
  timeframe: Timeframe,
  startTime: number,
  endTime: number,
  remainingTimeframes: Timeframe[]
): TimeframeTree[] {
  const interval = timeframeMilliseconds[timeframe];
  const trees: TimeframeTree[] = [];

  for (let time = startTime; time < endTime; time += interval) {
    const node: TimeframeTree = { timeframe: timeframe, time };
    if (remainingTimeframes.length > 0) {
      node.children = createTree(
        remainingTimeframes[0],
        time,
        time + interval,
        remainingTimeframes.slice(1)
      );
    }
    trees.push(node);
  }

  return trees;
}

export function generateTimeframeTrees(
  timeframes: Timeframe[],
  startTime: Date | number,
  endTime: Date | number
): TimeframeTree[] {
  const sortedTimeframes = timeframes.sort((a, b) => {
    return timeframeMilliseconds[b] - timeframeMilliseconds[a];
  });

  const startTimestamp = new Date(startTime).getTime();
  const endTimestamp = new Date(endTime).getTime();

  return createTree(
    sortedTimeframes[0],
    startTimestamp,
    endTimestamp,
    sortedTimeframes.slice(1)
  );
}
