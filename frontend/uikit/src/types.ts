import { CollateralSymbol } from "./tokens";

export type Address = `0x${string}`;

export type Direction = -1 | 1;

export type BOLDTokenSymbol = "BOLD";

export type TokenSymbol =
  | BOLDTokenSymbol
  | "LQTY"
  | "LUSD"
  | CollateralSymbol;

export type Token = {
  icon: string;
  name: string;
  symbol: TokenSymbol;
};

export type StatusMode = "positive" | "warning" | "negative" | "neutral";
