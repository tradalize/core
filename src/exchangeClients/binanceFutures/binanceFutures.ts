import { Candle } from "../../index.js";
import { ExchangeClient } from "../exchangeClient.abstract.js";
import type { FetchClient } from "../../fetchClient/fetchClient.js";
import type { GetDataForPeriodProps } from "../types.js";
import type { BinanceRawKline, BinanceSymbol } from "./binance.types.js";

const BINANCE_FUTURES_HOST = "https://fapi.binance.com/fapi/v1/";

export class BinanceFuturesClient extends ExchangeClient {
  retryCounter = 0;

  constructor(
    baseUrl = BINANCE_FUTURES_HOST,
    fetchClient?: typeof FetchClient
  ) {
    super(baseUrl, fetchClient);
  }

  public async getDataForPeriod({
    symbol,
    startTime,
    endTime,
    timeframe,
    limit = 1500,
  }: GetDataForPeriodProps): Promise<Candle[]> {
    const params = new URLSearchParams({
      symbol,
      interval: timeframe,
      limit: String(limit),
    });

    if (startTime) {
      params.append("startTime", startTime.getTime().toString());
    }

    if (endTime) {
      params.append("endTime", endTime.getTime().toString());
    }

    try {
      console.info(`Start loading ${symbol} ${timeframe}`);

      const data = await this.client.get<BinanceRawKline[]>(
        `/klines?${params}`
      );

      console.info(
        `Data loaded: ${data.length} items since ${
          startTime ? startTime.toString() : "[startTime not provided]"
        }`
      );

      this.retryCounter = 0;
      return mapKlineData(data);
    } catch (error) {
      this.retryCounter++;

      if (this.retryCounter > 5) {
        this.retryCounter = 0;
        throw error;
      }

      return this.getDataForPeriod({
        symbol,
        startTime,
        endTime,
        timeframe,
        limit,
      });
    }
  }

  public async getSymbols(): Promise<string[]> {
    const data = await this.client.get<{ symbols: BinanceSymbol[] }>(
      "/exchangeInfo"
    );

    return data.symbols
      .filter(
        ({ quoteAsset, contractType }) =>
          quoteAsset === "USDT" && contractType === "PERPETUAL"
      )
      .map(({ symbol }) => symbol);
  }
}

function mapKlineData(klines: BinanceRawKline[]): Candle[] {
  return klines.map(
    ([openTime, open, high, low, close, volume, closeTime]) => ({
      openTime,
      open: Number(open),
      high: Number(high),
      low: Number(low),
      close: Number(close),
      volume: Number(volume),
      closeTime,
    })
  );
}
