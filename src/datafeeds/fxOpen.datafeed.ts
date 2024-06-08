import {
  FXOpenClient,
  FXOpenProps,
  FX_TIMEFRAME,
  FxTimeframe,
} from "../exchangeClients/fxOpen/index.js";
import type { AxiosStatic } from "axios";
import { MainframeProps } from "../mainframe.js";
import { Candle, Datafeed, Timeframe, TIMEFRAME } from "./datafeed.abstract.js";

type Props = MainframeProps & FXOpenProps & { startTime: number };

export class FXOpenDatafeed extends Datafeed {
  symbol: string;
  timeframe: Timeframe;
  startTime: number;
  fxOpenTimeframe: FxTimeframe;

  client: FXOpenClient;

  constructor(
    { symbol, timeframe, startTime, apiHost, apiId, apiKey, apiSecret }: Props,
    axios: AxiosStatic
  ) {
    super();

    const fxOpenTimeframe = timeframesMap.get(timeframe);

    if (!fxOpenTimeframe) {
      throw new Error(`Unsupported timeframe ${timeframe}`);
    }

    this.symbol = symbol;
    this.fxOpenTimeframe = fxOpenTimeframe;
    this.startTime = startTime;

    this.client = new FXOpenClient(
      { apiHost, apiId, apiKey, apiSecret },
      axios
    );
  }

  async loadNextChunk(): Promise<Candle[]> {
    const candles = await this.client.getDataForPeriod(
      this.symbol,
      this.fxOpenTimeframe,
      this.startTime
    );

    if (candles.length !== 0) {
      this.startTime = (candles.at(-1)?.closeTime ?? Date.now()) + 1;
    }

    return candles;
  }
}

const timeframesMap = new Map<Timeframe, FxTimeframe>([
  [TIMEFRAME.OneMinute, FX_TIMEFRAME.OneMinute],
  [TIMEFRAME.FiveMinutes, FX_TIMEFRAME.FiveMinutes],
  [TIMEFRAME.FifteenMinutes, FX_TIMEFRAME.FifteenMinutes],
  [TIMEFRAME.OneHour, FX_TIMEFRAME.OneHour],
  [TIMEFRAME.FourHours, FX_TIMEFRAME.FourHours],
  [TIMEFRAME.OneDay, FX_TIMEFRAME.OneDay],
  [TIMEFRAME.OneWeek, FX_TIMEFRAME.OneWeek],
]);
