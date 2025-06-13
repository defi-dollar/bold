import type { Address, CollateralSymbol, CollateralSymbols, Token, TokenSymbol } from "@liquity2/uikit";
import type { Dnum } from "dnum";
import type { ReactNode } from "react";
import type { BranchContracts } from "./contracts";
import { Hash, Hex } from "viem";

export type { Address, CollateralSymbol, CollateralSymbols, Dnum, Token, TokenSymbol };

export type RiskLevel = "low" | "medium" | "high";

export type BranchId = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;

export type TroveId = `0x${string}`;
export type PrefixedTroveId = `${BranchId}:${TroveId}`;

export type Branch = {
  id: BranchId;
  contracts: BranchContracts;
  branchId: BranchId; // to be removed, use `id` instead
  symbol: CollateralSymbol;
  strategies: Array<{ address: Address; name: string }>;
};

export type EnvBranch = Omit<Branch, "contracts">;

export function isBranchId(value: unknown): value is BranchId {
  return typeof value === "number" && value >= 0 && value <= 9;
}

export function isTroveId(value: unknown): value is TroveId {
  return typeof value === "string" && /^0x[0-9a-f]+$/.test(value);
}

export function isPrefixedtroveId(value: unknown): value is PrefixedTroveId {
  return typeof value === "string" && /^[0-9]:0x[0-9a-f]+$/.test(value);
}

// Utility type to get type-safe entries of an object,
// to be used like this: Object.entries(o) as Entries<typeof o>)
export type Entries<T> = {
  [K in keyof T]: [K, T[K]];
}[keyof T][];

export type MenuSection = {
  actions: Array<{
    href: string;
    name: ReactNode;
    secondary: ReactNode;
    token: Token["symbol"];
  }>;
  href: string;
  label: ReactNode;
};

export type TroveStatus =
  | "active"
  | "closed"
  | "liquidated"
  | "redeemed";

export type PositionLoanBase = {
  // TODO: rename the type to "loan" and move "borrow" | "multiply" to
  // a "mode" field. The two separate types come from a previous design
  // where the two types of positions were having separate types.
  type: "borrow" | "multiply";
  batchManager: null | Address;
  borrowed: Dnum;
  borrower: Address;
  branchId: BranchId;
  deposit: Dnum;
  interestRate: Dnum;
  status: TroveStatus;
};

export type PositionLoanCommitted = PositionLoanBase & {
  troveId: TroveId;
  createdAt: number;
};

export type PositionLoanUncommitted = PositionLoanBase & {
  troveId: null;
};

export type PositionLoan = PositionLoanCommitted | PositionLoanUncommitted;

export function isPositionLoan(position: Position): position is PositionLoan {
  return position.type === "borrow" || position.type === "multiply";
}
export function isPositionLoanCommitted(
  position: Position,
): position is PositionLoanCommitted {
  return isPositionLoan(position) && position.troveId !== null;
}
export function isPositionLoanUncommitted(
  position: Position,
): position is PositionLoanUncommitted {
  return isPositionLoan(position) && position.troveId === null;
}

export type PositionEarn = {
  type: "earn";
  owner: Address;
  branchId: BranchId;
  deposit: Dnum;
  rewards: {
    bold: Dnum;
    coll: Dnum;
  };
};

export type PositionPool1 = {
  type: "pool1";
  owner: Address;
  poolId: string;
  deposit: Dnum;
  rewards: {
    defi: Dnum;
  };
};

export type PositionPool2 = {
  type: "pool2";
  owner: Address;
  poolId: string;
  deposit: Dnum;
  rewards: {
    defi: Dnum;
  };
  positions: Pool2Position[];
  claimData: Pool2ClaimData;
};

export type Pool2Position = {
  type: string;
  feeTier: number;
  amountUSD: Dnum;
  tokenId: string;
  lpToken: {
    symbol: string;
  }
}

export type Pool2ClaimData = {
  users: Address[];
  tokens: Address[];
  amounts: bigint[];
  proofs: Hash[][];
}

export type PositionStake = {
  type: "stake";
  owner: Address;
  deposit: Dnum;
  totalStaked: Dnum;
  rewards: {
    lusd: Dnum;
    eth: Dnum;
  };
};

export type Position = PositionLoan | PositionEarn | PositionStake;

export type Delegate = {
  address: Address;
  boldAmount: Dnum;
  fee?: Dnum;
  followers: number;
  id: string;
  interestRate: Dnum;
  interestRateChange: {
    min: Dnum;
    max: Dnum;
    period: bigint;
  };
  lastDays: number;
  name: string;
  redemptions: Dnum;
};

export type LoanDetails = {
  collPrice: Dnum | null;
  debt: Dnum | null;
  deposit: Dnum | null;
  depositPreLeverage: Dnum | null;
  depositToZero: Dnum | null;
  depositUsd: Dnum | null;
  interestRate: Dnum | null;
  leverageFactor: number | null;
  liquidationPrice: Dnum | null;
  liquidationRisk: RiskLevel | null;
  ltv: Dnum | null;
  maxDebt: Dnum | null;
  maxDebtAllowed: Dnum | null;
  maxLtv: Dnum;
  maxLtvAllowed: Dnum;
  redemptionRisk: RiskLevel | null;
  status:
    | null
    | "healthy"
    | "at-risk" // above the max LTV allowed by the app when opening
    | "liquidatable" // above the max LTV before liquidation
    | "underwater"; // above 100% LTV
};

// governance
export type Initiative =
  & {
    address: Address;
    name: string | null;
    protocol: string | null;
  }
  & (
    | { tvl: Dnum; pairVolume: Dnum; votesDistribution: Dnum }
    | { tvl: null; pairVolume: null; votesDistribution: null }
  );

export type Vote = "for" | "against";
export type VoteAllocation = { vote: Vote | null; value: Dnum };
export type VoteAllocations = Record<Address, VoteAllocation>;

export type DefiDollarAPIPool2Positions = Array<{
  poolId: string;
  tokenId: string;
  token0: {
    address: string;
    symbol: string;
  };
  token1: {
    address: string;
    symbol: string;
  };
  amount0: string;
  amount1: string;
  amountUSD: string;
  feeTier: number;
  status: string;
}>

export type MerklAPIOpportunity = {
  chainId: number;
  type: string;
  identifier: string;
  name: string;
  description: string;
  howToSteps: string[];
  status: string;
  action: string;
  tvl: number;
  apr: number;
  dailyRewards: number;
  tags: string[];
  id: string;
  depositUrl: string;
  explorerAddress: string;
  lastCampaignCreatedAt: number;
  tokens: Array<{
    id: string;
    name: string;
    chainId: number;
    address: string;
    decimals: number;
    icon: string;
    verified: boolean;
    isTest: boolean;
    isPoint: boolean;
    isPreTGE: boolean;
    isNative: boolean;
    price: number;
    symbol: string;
  }>;
  chain: {
    id: number;
    name: string;
    icon: string;
    Explorer: Array<{
      id: string;
      type: string;
      url: string;
      chainId: number;
    }>;
  };
  protocol: {
    id: string;
    tags: string[];
    name: string;
    description: string;
    url: string;
    icon: string;
  };
  aprRecord: {
    cumulated: number;
    timestamp: string;
    breakdowns: Array<{
      distributionType: string;
      identifier: string;
      type: string;
      value: number;
    }>;
  };
  tvlRecord: {
    id: string;
    total: number;
    timestamp: string;
    breakdowns: Array<{
      identifier: string;
      type: string;
      value: number;
    }>;
  };
  rewardsRecord: {
    id: string;
    total: number;
    timestamp: string;
    breakdowns: Array<{
      token: {
        id: string;
        name: string;
        chainId: number;
        address: string;
        decimals: number;
        symbol: string;
        displaySymbol: string;
        icon: string;
        verified: boolean;
        isTest: boolean;
        isPoint: boolean;
        isPreTGE: boolean;
        isNative: boolean;
        price: number;
      };
      amount: string;
      value: number;
      distributionType: string;
      id: string;
      campaignId: string;
      dailyRewardsRecordId: string;
    }>;
  };
};

export type MerklAPIUserRewards = Array<{
  chain: {
    id: number;
    name: string;
    icon: string;
    Explorer: Array<{
      id: string;
      type: string;
      url: string;
      chainId: number;
    }>;
  };
  rewards: Array<{
    root: string;
    recipient: Address;
    amount: string;
    claimed: string;
    pending: string;
    proofs: Hex[];
    token: {
      address: Address;
      chainId: number;
      symbol: string;
      decimals: number;
      price: number;
    };
    breakdowns: Array<{
      reason: string;
      amount: string;
      claimed: string;
      pending: string;
      campaignId: string;
    }>;
  }>;
}>;
