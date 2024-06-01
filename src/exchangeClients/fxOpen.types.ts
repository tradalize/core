export type FXOpenPosition = {
  Id: number;
  Symbol: string;
  LongAmount: number;
  LongPrice: number;
  ShortAmount: number;
  ShortPrice: number;
  Commission: number;
  AgentCommission: number;
  Swap: number;
  Modified: number; // Timestamp, miliseconds
  Margin: number;
  Profit: number;
  CurrentBestAsk: number;
  CurrentBestBid: number;
  TransferringCoefficient: number;
  Created: number; // Timestamp, miliseconds
};

export type FXOpenBar = {
  Volume: number;
  Close: number;
  Low: number;
  High: number;
  Open: number;
  Timestamp: number;
};

export type FXOpenAccountInfo = {
  Id: number;
  AccountingType: string;
  Name: string;
  FirstName: string;
  LastName: string;
  Phone: string;
  Country: string;
  State: string;
  City: string;
  Address: string;
  ZipCode: string;
  SocialSecurityNumber: string;
  Email: string;
  Comment: string;
  Registered: number;
  Modified: number;
  IsArchived: boolean;
  IsBlocked: boolean;
  IsReadonly: boolean;
  IsValid: boolean;
  IsWebApiEnabled: boolean;
  Leverage: number;
  Balance: number;
  BalanceCurrency: string;
  Profit: number;
  Commission: number;
  AgentCommission: number;
  Swap: number;
  Rebate: number;
  Equity: number;
  Margin: number;
  MarginLevel: number;
  MarginCallLevel: number;
  StopOutLevel: number;
  ReportCurrency: string;
  TokenCommissionCurrency: string;
  TokenCommissionCurrencyDiscount: number;
  IsTokenCommissionEnabled: boolean;
  MaxOverdraftAmount: number;
  OverdraftCurrency: string;
  UsedOverdraftAmount: number;
  Throttling: Array<{
    Protocol: string;
    SessionsPerAccount: number;
    RequestsPerSecond: number;
    ThrottlingMethods: [
      {
        Method: string;
        RequestsPerSecond: number;
        ConcurrentRequestCount: number;
      },
    ];
    ConcurrentRequestCount: number;
  }>;
  IsLongOnly: boolean;
};

export type FXOpenOrderTypes =
  | "Market"
  | "Limit"
  | "Stop"
  | "Position"
  | "StopLimit";

export type FXOpenOrderSides = "Buy" | "Sell";

export type FXOpenOrderStatuses =
  | "New"
  | "Calculated"
  | "Filled"
  | "Canceled"
  | "Rejected"
  | "Expired"
  | "PartiallyFilled"
  | "Activated"
  | "Executing"
  | "Invalid";

export type FXOpenContingentOrderTriggerTypes =
  | "None"
  | "OnPendingOrderExpired"
  | "OnPendingOrderPartiallyFilled"
  | "OnTime";

export type FXOpenTrade = {
  Id: number;
  ClientId: string;
  AccountId: number;
  Type: FXOpenOrderTypes;
  InitialType: FXOpenOrderTypes;
  Side: FXOpenOrderSides;
  Status: FXOpenOrderStatuses;
  Symbol: string;
  SymbolPrecision?: number;
  Price: number;
  StopPrice?: number;
  CurrentPrice: number;
  InitialAmount: number;
  RemainingAmount: number;
  FilledAmount: number;
  MaxVisibleAmount: number;
  StopLoss?: number;
  TakeProfit?: number;
  Margin?: number;
  Profit?: number;
  Commission?: number;
  AgentCommission?: number;
  Swap?: number;
  ImmediateOrCancel: boolean;
  MarketWithSlippage: boolean;
  FillOrKill: boolean;
  OneCancelsTheOther: boolean;
  Created: number;
  Expired?: number;
  Modified?: number;
  Filled?: number; // Filled timestamp
  PositionCreated?: number;
  Comment: string;
  ClientApp: string;
  Slippage?: number;
  Rebate?: number;
  RelatedTradeId?: number;
  ContingentOrder: boolean;
  TriggerType: FXOpenContingentOrderTriggerTypes;
  TriggerTime?: number;
  OrderIdTriggeredBy?: number;
};

export type CreateFXOpenTradePayload = {
  ClientId?: string; // Client trade Id
  Type: FXOpenOrderTypes; // Type of trade. Possible values: "Market", "Limit", "Stop", "StopLimit"
  Side: FXOpenOrderSides; // Side of trade. Possible values: "Buy", "Sell"
  Symbol: string; // Trade symbol (e.g. "EURUSD")
  Price?: number; // Price of the "Limit" trades (for Market trades price field is ignored)
  StopPrice?: number; // Price of the "Stop" trades (for Market trades price field is ignored)
  Amount: number; // Trade amount
  Slippage?: number; // Slippage. Possible values: 0..1
  StopLoss?: number; // Stop loss price
  TakeProfit?: number; // Take profit price
  Expired?: number; // Expiration date and time (milliseconds) for pending and contingent trades ("Limit", "Stop", "StopLimit")
  ImmediateOrCancel?: boolean; // "Immediate or cancel" flag (works only for "Limit" and "StopLimit" trades)
  MarketWithSlippage?: boolean; // "MarketWithSlippage" flag (works only for "Limit" and "StopLimit" trades)
  OneCancelsTheOther?: boolean; // "OneCancelsTheOther" flag (works only for a pair of trades "Limit-Stop" or "Stop-Stop")
  OcoEqualAmount?: boolean; // "OcoEqualAmount" flag means taking the amount from the other order otherwise from the request (works only with "OneCancelsTheOther")
  RelatedTradeId?: string; // Related Trade Id is used when option OneCancelsTheOther is set
  ContingentOrder?: boolean; // "ContingentOrder" flag
  TriggerType?: FXOpenContingentOrderTriggerTypes; // Trigger Type is used when order is contingent. Possible values: "OnTime", "OnPendingOrderExpired", "OnPendingOrderPartiallyFilled"
  TriggerTime?: number; // Trigger Time is used when order is contingent and Trigger Type is "OnTime"
  OrderIdTriggeredBy?: string; // OrderIdTriggeredBy is used when order is contingent and Trigger Type is "OnPendingOrderExpired"or "OnPendingOrderPartiallyFilled"
  Comment?: string; // Client comment
};

export type CancelFXOpenTradeType = "Cancel" | "Close" | "CloseBy";

export type CancelFXOpenTradePayload = {
  Type: CancelFXOpenTradeType; // Delete trade operation type. Possible values: Cancel, Close, CloseBy.
  Id: number; // Trade Id to cancel or close
  Amount?: number; // Trade close amount (only for Close operation)
  ById?: number; // Close by trade Id (only for CloseBy operation)
};
