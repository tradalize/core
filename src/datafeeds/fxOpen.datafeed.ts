import { FXOpenPublicClient } from "../exchangeClients/fxOpen/index.js";
import { MainframeProps } from "../mainframe.js";
import { Datafeed } from "./datafeed.abstract.js";
import { Timeframe, Candle } from "../exchangeClients/types.js";

let exchangeClient: FXOpenPublicClient;

function getExchangeClient(apiHost: string) {
  if (!exchangeClient) {
    exchangeClient = new FXOpenPublicClient(apiHost);
  }

  return exchangeClient;
}

type Props = MainframeProps & { apiHost: string; startTime: Date };

export class FXOpenDatafeed extends Datafeed {
  symbol: string;
  timeframe: Timeframe;
  startTime: Date;

  client: FXOpenPublicClient;

  constructor({ symbol, timeframe, startTime, apiHost }: Props) {
    super({ timeframe });

    this.symbol = symbol;
    this.timeframe = timeframe;
    this.startTime = startTime;

    this.client = getExchangeClient(apiHost);
  }

  async loadNextChunk(): Promise<Candle[]> {
    const candles = await this.client.getDataForPeriod({
      symbol: this.symbol,
      timeframe: this.timeframe,
      startTime: this.startTime,
    });

    if (candles.length !== 0) {
      this.startTime = new Date((candles.at(-1)?.closeTime ?? Date.now()) + 1);
    }

    return candles;
  }
}
