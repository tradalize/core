# @tradalize/core

`@tradalize/core` is a JavaScript library designed to facilitate algorithmic trading backtesting. The library provides a set of functions and classes allowing users to efficiently run backtests for their trading algorithms.

## Getting Started

### Installation

Install the package using npm:

```bash
npm install @tradalize/core

```

## Usage

The main entry point in your future backrest is a `Mainframe` class

```ts
import { Mainframe } from "@tradalize/core";
```

To run properly this class requires 2 parameters to be provided in its constructor - `Datafeed` and `Strategy`. These are essential concepts.

### Datafeed

`Datafeed` is a class, that will provide candlestick data to your `Strategy`. You can implement your own `Datafeed` (to provide data from your local DB or even from a file) or use some of the already implemented classes in this library (e.g. `BinanceFuturesDatafeed`)

```ts
import { BinanceFuturesDatafeed } from "@tradalize/core";
```

To implement your custom `Datafeed` you need to extend the abstract class and implement only 1 method and 2 properties

```ts
import { Datafeed } from "@tradalize/core";

class MyCustomDatafeed extends Datafeed {
  // A symbol/ticker to load
  symbol: string; // A Timeframe wo work with (1d, 1h)

  timeframe: Timeframe;

  public async loadNextChunk(): Promise<Candle[]> {
    // Here write your logic for loading new data
  }
}
```

That's it. After that, this `Datafeed` will emulate the market behavior and provide a new `Candle` one by one to your strategy. When it reaches the end of the list, it will try to load a new chunk of data by calling the `loadNextChunk` method. If this method returns an empty array, backtesting will stop. So you can control which part of your data you want to run your backtests on.

### Broker

Before proceeding with `Strategy` we have to discuss `Broker` because they are tight together. During your backtests your strategy will execute orders. You can decide just to run your backtest in memory and see the result or save your trades to some persistent storage (DB, spreadsheet, whatever...) for further analysis. That is what `Broker` is responsible for.

Same as all entities mentioned in this guide, you simply need to import and extend an abstract class, or you can use some predefined Brokers.

```ts
import { Broker } from "@tradalize/core";

class MyBroker extends Broker {
  public openPosition(payload: OpenPositionPayload): void | Promise<void> {
    // Implement your logic for the position opening here
    // See the payload type in the type-hint
  }

  public closePosition(payload: ClosePositionPayload): void | Promise<void> {
    // Implement your logic for position closing here
    // See the payload type in the type-hint
  }
}
```

### Strategy

`Strategy` is the most valuable part of any backtest. Here you will implement your logic for making trading decisions.

There is a few `Strategy` methods you have to implement

### `update`

`update` - is an obligatory method to implement to make your strategy work.
This method will receive a new candle one by one until they end

```ts
import { Strategy, POSITION_DIRECTION } from "@tradalize/core";

class MyStrategy extends Strategy {
  public update(candle: Candle, props: MainframeProps): void | Promise<void> {
    const dayOfTheWeek = new Date(candle.openTime).getDay(); // Some trading condition

    if (dayOfTheWeek === 0) {
      /**
       * To open a trade you need to set this internal property called `openOnNext`
       * Trade will be executed on the next candle open
       * You have to provide a symbol, timeframe, and direction of the opening position
       * Additionally you can provide `sl` - stop loss and `tp` - take profit values here
       * Or you can implement `calcSl` and `calcTp` methods to calculate them dynamically
       */
      this.openOnNext = {
        symbol: props.symbol,
        timeframe: props.timeframe,
        direction: POSITION_DIRECTION.Long,
      };
    }

    if (dayOfTheWeek === 5) {
      // Same for the cancelation of the position, but here you just have to use the boolean value
      this.closeOnNext = true;
    }
  }
}
```

### `calcSl`

`calcSl` - is a method to dynamically calculate the stop loss of your position. You can calculate it in your `update` method and provide `sl` param to `openOnNext` property, so this is just a syntax sugar to make this calculation more unified across various strategies.

If you don't need stop loss or don't need a dynamic calculation of it - you can simply return `undefined` from it

```ts
class MyStrategy extends Strategy {
  protected calcSl() {
    return;
  }
}
```

Example of dynamic calculation using indicator value from the strategy

```ts
class MyStrategy extends Strategy {
  protected calcSl(
    price: number,
    direction: PositionDirection
  ): number | undefined {
    return price - this.atrValue * SL_ATR_RATIO * direction;
  }
}
```

> [!IMPORTANT]
> If you provide `sl` or `tp` to `openOnNext` property - those values will override your dynamic calculation from `calcSl` and `calcTp`

### `calcTp`

Same as `calcSl`, but for the take profit. See examples above

### Mainframe

And finally - let's run our strategy

```ts
import { Mainframe } from "@tradalize/core";

const broker = new MyBroker();
const strategy = new MyStrategy(broker);

const mf = new Mainframe(datafeed, strategy);

await mf.backtest();
```

That's it :)

## Afterwords

This is only essential functionality. This guide does not cover how to work with analysis, analyze your trades, and strategy performance. It will be added later on.

As I said before - this is only a library. But I will add a starter app template to provide more "framework-ish" developer experience for the backtesting
