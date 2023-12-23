import type { ObjectValues } from "../utils/utility.types.js";
import { Candle } from "../index.js";

export const POSITION_DIRECTION = {
	Long: 1,
	Short: -1,
} as const;

export type PositionDirection = ObjectValues<typeof POSITION_DIRECTION>;

export abstract class Strategy {
	public abstract update(candle: Candle): void | Promise<void>;
}
