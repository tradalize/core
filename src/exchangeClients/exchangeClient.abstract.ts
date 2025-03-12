import { Candle } from "../index.js";
import { FetchClient } from "../fetchClient/fetchClient.js";
import { GetDataForPeriodProps } from "./types.js";

export abstract class ExchangeClient {
  protected client: FetchClient;

  constructor(baseUrl: string, fetchClient: typeof FetchClient = FetchClient) {
    this.client = fetchClient.create(baseUrl);
  }

  /**
   * Pull candles for a given period from the exchange
   */
  public abstract getDataForPeriod(
    props: GetDataForPeriodProps
  ): Promise<Candle[]>;

  /**
   * Get all symbols available on the exchange
   */
  public abstract getSymbols(): Promise<string[]>;
}
