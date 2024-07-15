import { Candle } from "../index.js";
import { GetDataForPeriodProps } from "./types.js";

export abstract class ExchangeClient {
  public abstract getDataForPeriod(
    props: GetDataForPeriodProps
  ): Promise<Candle[]>;
}
