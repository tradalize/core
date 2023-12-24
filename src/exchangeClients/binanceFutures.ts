import type { AxiosInstance, AxiosStatic } from "axios";
import { Candle, Timeframe } from "../index.js";

export type BinanceRawKline = [
  number, // Open time
  string, // Open
  string, // High
  string, // Low
  string, // Close
  string, // Volume
  number, // Close time
  string, // Quote asset volume
  number, // Number of trades
  string, // Taker buy base asset volume
  string, // Taker buy quote asset volume
  string, // Ignore.
];

type TSymbol = {
  symbol: string;
  quoteAsset: string;
  contractType: string;
};

export class BinanceFuturesClient {
  client: AxiosInstance;

  retryCounter = 0;

  constructor(axios: AxiosStatic) {
    this.client = axios.create({
      baseURL: "https://fapi.binance.com",
    });
  }

  public async getDataForPeriod({
    symbol,
    startTime,
    endTime,
    interval,
    limit = 1500,
  }: {
    symbol: string;
    interval: Timeframe;
    startTime?: Date;
    endTime?: Date;
    limit?: number;
  }): Promise<Candle[]> {
    const params = new URLSearchParams({
      symbol,
      interval,
      limit: String(limit),
    });

    if (startTime) {
      params.append("startTime", startTime.getTime().toString());
    }

    if (endTime) {
      params.append("endTime", endTime.getTime().toString());
    }

    try {
      console.info(`Start loading ${symbol} ${interval}`);

      const { data } = await this.client.get<BinanceRawKline[]>(
        "/fapi/v1/klines?" + params.toString(),
        {
          timeout: 2000,
        }
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
        interval,
        limit,
      });
    }
  }

  public async getExchangeInfo() {
    const { data } = await this.client.get<{ symbols: TSymbol[] }>(
      "/fapi/v1/exchangeInfo",
      {
        timeout: 2000,
      }
    );

    return data;
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
