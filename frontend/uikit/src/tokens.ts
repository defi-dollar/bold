import type { Token } from "./types";

import tokenBold from "./token-icons/DUSD.svg";
import tokenLusd from "./token-icons/lusd.svg";
import tokenEth from "./token-icons/eth.svg";
import tokenWBTC from './token-icons/WBTC.png';
import tokenLINK from './token-icons/LINK.png';
import tokenUNI from './token-icons/UNI.png';
import tokenAAVE from './token-icons/AAVE.png';
import tokenENA from './token-icons/ENA.png';
import tokenLDO from './token-icons/LDO.png';
import tokenCRV from './token-icons/CRV.png';
// import tokenFXS from './token-icons/FXS.png';
import tokenSKY from './token-icons/SKY.png';
import tokenLQTY from './token-icons/lqty.svg';

export const BOLD_TOKEN_SYMBOL = 'DUSD';

export type CollateralSymbols = [
  "WBTC",
  "LINK",
  "UNI",
  "AAVE",
  "ENA",
  "LDO",
  "CRV",
  "FXS",
  "SKY",
  "LQTY",
];

export type CollateralSymbol = CollateralSymbols[number];

export function isCollateralSymbol(symbol: string): symbol is CollateralSymbol { 
  return [
    "WBTC",
    "LINK",
    "UNI",
    "AAVE",
    "ENA",
    "LDO",
    "CRV",
    "FXS",
    "SKY",
    "LQTY",
  ].includes(symbol);
}

export type CollateralToken = Token & {
  collateralRatio: number;
  symbol: CollateralSymbol;
};

export const WBTC: CollateralToken  = {
  icon: tokenWBTC,
  name: "WBTC",
  symbol: "WBTC" as const,
  collateralRatio: 1.25,
};

export const LINK: CollateralToken  = {
  icon: tokenLINK,
  name: "LINK",
  symbol: "LINK" as const,
  collateralRatio: 1.33,
};

export const UNI: CollateralToken  = {
  icon: tokenUNI,
  name: "UNI",
  symbol: "UNI" as const,
  collateralRatio: 1.39,
};

export const AAVE: CollateralToken  = {
  icon: tokenAAVE,
  name: "AAVE",
  symbol: "AAVE" as const,
  collateralRatio: 1.39,
};

export const ENA: CollateralToken  = {
  icon: tokenENA,
  name: "ENA",
  symbol: "ENA" as const,
  collateralRatio: 1.74,
};

export const LDO: CollateralToken  = {
  icon: tokenLDO,
  name: "LDO",
  symbol: "LDO" as const,
  collateralRatio: 1.74,
};

export const CRV: CollateralToken  = {
  icon: tokenCRV,
  name: "CRV",
  symbol: "CRV" as const,
  collateralRatio: 1.74,
};

export const FXS: CollateralToken  = {
  icon: tokenBold,
  name: "FXS",
  symbol: "FXS" as const,
  collateralRatio: 1.74,
};

export const SKY: CollateralToken  = {
  icon: tokenSKY,
  name: "SKY",
  symbol: "SKY" as const,
  collateralRatio: 1.39,
};

export const LQTY: CollateralToken  = {
  icon: tokenLQTY,
  name: "LQTY",
  symbol: "LQTY" as const,
  collateralRatio: 1.74,
};

export const ETH: Token = {
  icon: tokenEth,
  name: "ETH",
  symbol: "ETH" as const,
} as const;

export const LUSD: Token = {
  icon: tokenLusd,
  name: "LUSD",
  symbol: "LUSD" as const,
} as const;

export const BOLD: Token = {
  icon: tokenBold,
  name: BOLD_TOKEN_SYMBOL,
  symbol: BOLD_TOKEN_SYMBOL,
} as const;

export const COLLATERALS: CollateralToken[] = [
  WBTC,
  LINK,
  UNI,
  AAVE,
  ENA,
  LDO,
  CRV,
  FXS,
  SKY,
  LQTY,
];

export const TOKENS_BY_SYMBOL = {
  [BOLD_TOKEN_SYMBOL]: BOLD,
  LUSD,
  WBTC,
  LINK,
  UNI,
  AAVE,
  ENA,
  LDO,
  CRV,
  FXS,
  SKY,
  LQTY,
  ETH,
} as const;
