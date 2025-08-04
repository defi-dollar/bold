import tokenBold from "./token-icons/DUSD.svg";
import tokenSbold from "./token-icons/sbold.svg";
import tokenLusd from "./token-icons/lusd.svg";
import tokenEth from "./token-icons/eth.svg";
import tokenWBTC from './token-icons/WBTC.png';
import tokenLINK from './token-icons/LINK.png';
import tokenUNI from './token-icons/UNI.png';
import tokenAAVE from './token-icons/aave-token-round.svg';
import tokenLDO from './token-icons/LDO.png';
import tokenCRV from './token-icons/CRV.png';
import tokenFRAX from './token-icons/FRAX icon.svg';
import tokenSKY from './token-icons/SKY.png';
import tokenLQTY from './token-icons/lqty.svg';
import tokenYFI from './token-icons/YFI.png';
import tokenDEFI from './token-icons/DEFI.svg';
import tokenDusdBold from './token-icons/DUSDBOLD.png';
import tokenDusdFraxbp from './token-icons/DUSDFRAXBP.png';
import tokenDefiWeth from './token-icons/DEFIWETH.png';

export const BOLD_TOKEN_SYMBOL = 'USDFI';

export type CollateralSymbols = [
  "ETH", // To bypass type-checking
  "LQTY",
  "FXS",
  "LINK",
  "UNI",
  "SKY",
  "CRV",
  "AAVE",
  "YFI",
  "LDO",
  "LQTY",
  "WBTC",
];

export type CollateralSymbol = CollateralSymbols[number];

export function isCollateralSymbol(symbol: string): symbol is CollateralSymbol { 
  return [
    "FXS",
    "LINK",
    "UNI",
    "SKY",
    "CRV",
    "AAVE",
    "YFI",
    "LDO",
    "LQTY",
    "WBTC",
  ].includes(symbol);
}

// any external token, without a known symbol
export type ExternalToken = {
  icon: string;
  name: string;
  symbol: string;
};

// a token with a known symbol (TokenSymbol)
export type Token = ExternalToken & {
  icon: string;
  name: string;
  symbol: TokenSymbol;
};

export function isTokenSymbol(symbolOrUrl: string): symbolOrUrl is TokenSymbol {
  return (
    symbolOrUrl === BOLD_TOKEN_SYMBOL
    || symbolOrUrl === "ETH"
    || symbolOrUrl === "LQTY"
    || symbolOrUrl === "LUSD"
    || symbolOrUrl === "RETH"
    || symbolOrUrl === "SBOLD"
    || symbolOrUrl === "WSTETH"
  );
}

export type BOLDTokenSymbol = typeof BOLD_TOKEN_SYMBOL;

export type TokenSymbol =
  | BOLDTokenSymbol
  | "SBOLD"
  | "LQTY"
  | "LUSD"
  | "ETH"
  | "DEFI"
  | "USDFIBOLD"
  | "USDFIFRXUSD"
  | "DEFIWETH"
  | CollateralSymbol;

export type CollateralToken = Token & {
  collateralRatio: number;
  symbol: CollateralSymbol;
  decimals: number;
};

export const WBTC: CollateralToken  = {
  icon: tokenWBTC,
  name: "WBTC",
  symbol: "WBTC" as const,
  collateralRatio: 1.176470588235294117,
  decimals: 8,
};

export const LINK: CollateralToken  = {
  icon: tokenLINK,
  name: "LINK",
  symbol: "LINK" as const,
  collateralRatio: 1.333333333333333333,
  decimals: 18,
};

export const UNI: CollateralToken  = {
  icon: tokenUNI,
  name: "UNI",
  symbol: "UNI" as const,
  collateralRatio: 1.333333333333333333,
  decimals: 18,
};

export const AAVE: CollateralToken  = {
  icon: tokenAAVE,
  name: "AAVE",
  symbol: "AAVE" as const,
  collateralRatio: 1.333333333333333333,
  decimals: 18,
};

export const YFI: CollateralToken  = {
  icon: tokenYFI,
  name: "YFI",
  symbol: "YFI" as const,
  collateralRatio: 1.333333333333333333,
  decimals: 18,
};

export const LDO: CollateralToken  = {
  icon: tokenLDO,
  name: "LDO",
  symbol: "LDO" as const,
  collateralRatio: 1.333333333333333333,
  decimals: 18,
};

export const CRV: CollateralToken  = {
  icon: tokenCRV,
  name: "CRV",
  symbol: "CRV" as const,
  collateralRatio: 1.333333333333333333,
  decimals: 18,
};

export const FXS: CollateralToken  = {
  icon: tokenFRAX,
  name: "FRAX",
  symbol: "FXS" as const,
  collateralRatio: 1.333333333333333333,
  decimals: 18,
};

export const SKY: CollateralToken  = {
  icon: tokenSKY,
  name: "SKY",
  symbol: "SKY" as const,
  collateralRatio: 1.333333333333333333,
  decimals: 18,
};

export const LQTY: CollateralToken  = {
  icon: tokenLQTY,
  name: "LQTY",
  symbol: "LQTY" as const,
  collateralRatio: 1.538461538461538461,
  decimals: 18,
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

export const SBOLD: Token = {
  icon: tokenSbold,
  name: "sBOLD",
  symbol: "SBOLD" as const,
} as const;

export const DEFI: Token = {
  icon: tokenDEFI,
  name: "DEFI",
  symbol: "DEFI" as const,
} as const;

export const USDFIBOLD: Token = {
  icon: tokenDusdBold,
  name: "USDFI/BOLD LP",
  symbol: "USDFIBOLD" as const,
} as const;

export const USDFIFRXUSD: Token = {
  icon: tokenDusdFraxbp,
  name: "USDFI/frxUSD LP",
  symbol: "USDFIFRXUSD" as const,
} as const;

export const DEFIWETH: Token = {
  icon: tokenDefiWeth,
  name: "DEFI/WETH LP",
  symbol: "DEFIWETH" as const,
} as const;

export const COLLATERALS: CollateralToken[] = [
  WBTC,
  LINK,
  UNI,
  AAVE,
  YFI,
  LDO,
  CRV,
  FXS,
  SKY,
  LQTY,
];

export const TOKENS_BY_SYMBOL = {
  [BOLD_TOKEN_SYMBOL]: BOLD,
  SBOLD,
  LUSD,
  WBTC,
  LINK,
  UNI,
  AAVE,
  YFI,
  LDO,
  CRV,
  FXS,
  SKY,
  LQTY,
  ETH,
  DEFI,
  USDFIBOLD,
  USDFIFRXUSD,
  DEFIWETH,
} as const;
