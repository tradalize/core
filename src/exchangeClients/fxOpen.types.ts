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
  Filled?: number;
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
