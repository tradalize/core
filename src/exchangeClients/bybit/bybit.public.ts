import type { AxiosInstance, AxiosStatic } from "axios";
import { ExchangeClient } from "../exchangeClient.abstract.js";
import type { GetDataForPeriodProps, Candle } from "../types.js";
import type { ByBitKlineResponse, ByBitSymbolCategory } from "./bybit.types.js";
import { byBitKlineToCandle, getByBitTimeframe } from "./helpers.js";

const API_VERSION = "v5";

export class ByBitPublicClient implements ExchangeClient {
  client: AxiosInstance;

  constructor(axios: AxiosStatic) {
    this.client = axios.create({
      baseURL: `https://api.bybit.com/${API_VERSION}`,
    });
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

    const { data } = await this.client.get<ByBitKlineResponse>(
      `market/kline?${params.toString()}`
    );

    console.info(
      `Data loaded: ${data.result.list.length} items since ${
        startTime ? startTime.toString() : "[startTime not provided]"
      }`
    );

    return data.result.list.map((kline) =>
      byBitKlineToCandle(kline, byBitTimeframe)
    );
  }
}
