import { FetchClient } from "../../fetchClient/fetchClient.js";
import { ExchangeClient } from "../exchangeClient.abstract.js";
import { GetDataForPeriodProps, Candle } from "../types.js";
import { hlCandleTocandle } from "./helpers.js";
import { HLCandle, HLSymbol } from "./hyperliquid.types.js";

const HL_API_HOST = "https://api.hyperliquid.xyz";

export class HyperliquidFuturesPublicClient extends ExchangeClient {
  constructor(baseUrl = HL_API_HOST, fetchCLient = FetchClient) {
    super(baseUrl, fetchCLient);
  }

  public async getDataForPeriod({
    symbol,
    timeframe,
    startTime,
    endTime,
  }: GetDataForPeriodProps): Promise<Candle[]> {
    const data = await this.client.post<HLCandle[]>("info", {
      type: "candleSnapshot",
      req: {
        coin: symbol,
        interval: timeframe,
        startTime: startTime?.getTime(),
        endTime: endTime?.getTime(),
      },
    });

    return data.map(hlCandleTocandle);
  }

  public async getSymbols(): Promise<string[]> {
    const data = await this.client.post<{ universe: HLSymbol[] }>("info", {
      type: "meta",
    });

    return data.universe
      .filter((symbol) => !symbol.isDelisted)
      .map((symbol) => symbol.name);
  }
}
