import { FetchClient } from "../../fetchClient/fetchClient.js";
import { ExchangeClient } from "../exchangeClient.abstract.js";
import type { GetDataForPeriodProps, Candle } from "../types.js";
import type {
  ByBitKlineResponse,
  ByBitSymbol,
  ByBitSymbolCategory,
} from "./bybit.types.js";
import { byBitKlineToCandle, getByBitTimeframe } from "./helpers.js";

const BYBIT_API_HOST = "https://api.bybit.com/v5";

export class ByBitPublicClient extends ExchangeClient {
  constructor(baseUrl = BYBIT_API_HOST, fetchClient = FetchClient) {
    super(baseUrl, fetchClient);
  }

  public async getDataForPeriod({
    symbol,
    timeframe,
    startTime,
    endTime,
    limit = 1000,
    category = "linear",
  }: GetDataForPeriodProps & { category?: ByBitSymbolCategory }): Promise<
    Candle[]
  > {
    const byBitTimeframe = getByBitTimeframe(timeframe);

    const params = new URLSearchParams({
      category,
      symbol,
      interval: byBitTimeframe,
      limit: String(limit),
    });

    if (startTime) {
      params.append("start", startTime.getTime().toString());
    }

    if (endTime) {
      params.append("end", endTime.getTime().toString());
    }

    console.info(`Start loading ${symbol} ${timeframe}`);

    const data = await this.client.get<ByBitKlineResponse>(
      `market/kline?${params.toString()}`
    );

    console.info(
      `Data loaded: ${data.result.list.length} items since ${
        startTime ? startTime.toString() : "[startTime not provided]"
      }`
    );

    return data.result.list
      .map((kline) => byBitKlineToCandle(kline, byBitTimeframe))
      .sort((a, b) => a.openTime - b.openTime);
  }

  public async getSymbols(category: ByBitSymbolCategory = "linear") {
    const data = await this.client.get<{ result: { list: ByBitSymbol[] } }>(
      `/market/instruments-info?category=${category}&limit=1000`
    );

    return data.result.list
      .filter(
        ({ contractType, quoteCoin }) =>
          contractType === "LinearPerpetual" && quoteCoin === "USDT"
      )
      .map(({ symbol }) => symbol);
  }
}
