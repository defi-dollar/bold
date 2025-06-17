"use client";

import type { CollateralSymbol, CurveAPIPoolsResponse, TokenSymbol } from "@/src/types";
import type { UseQueryResult } from "@tanstack/react-query";
import type { Dnum } from "dnum";

import { POOL1_CONFIGS, PRICE_REFRESH_INTERVAL } from "@/src/constants";
import { getBranchContract } from "@/src/contracts";
import { dnum18 } from "@/src/dnum-utils";
import { COINGECKO_API_KEY } from "@/src/env";
import { BOLD_TOKEN_SYMBOL, DEFI, isCollateralSymbol } from "@liquity2/uikit";
import { useQuery } from "@tanstack/react-query";
import * as dn from "dnum";
import * as v from "valibot";
import { useConfig as useWagmiConfig } from "wagmi";
import { readContract } from "wagmi/actions";
import axios from "axios";
import { parseUnits } from "viem";

async function fetchCollateralPrice(
  symbol: CollateralSymbol,
  config: ReturnType<typeof useWagmiConfig>,
): Promise<Dnum> {
  const PriceFeed = getBranchContract(symbol, "PriceFeed");

  const FetchPriceAbi = PriceFeed.abi.find((fn) => fn.name === "fetchPrice");
  if (!FetchPriceAbi) {
    throw new Error("fetchPrice ABI not found");
  }

  const [price] = await readContract(config, {
    abi: [{ ...FetchPriceAbi, stateMutability: "view" }] as const,
    address: PriceFeed.address,
    functionName: "fetchPrice",
  });

  if (symbol === 'WBTC') {
    return [price, 18 + 10];
  }
  

  return dnum18(price);
}

type CoinGeckoSymbol = TokenSymbol & ("LQTY" | "LUSD");
const coinGeckoTokenIds: {
  [key in CoinGeckoSymbol]: string;
} = {
  "LQTY": "liquity",
  "LUSD": "liquity-usd",
};

async function fetchCoinGeckoPrice(symbol: CoinGeckoSymbol): Promise<Dnum> {
  const tokenId = coinGeckoTokenIds[symbol];

  const url = new URL("https://api.coingecko.com/api/v3/simple/price");
  url.searchParams.set("vs_currencies", "usd");
  url.searchParams.set("ids", tokenId);

  const headers: HeadersInit = { accept: "application/json" };

  if (COINGECKO_API_KEY?.apiType === "demo") {
    headers["x-cg-demo-api-key"] = COINGECKO_API_KEY.apiKey;
  }
  if (COINGECKO_API_KEY?.apiType === "pro") {
    headers["x-cg-pro-api-key"] = COINGECKO_API_KEY.apiKey;
  }

  const response = await fetch(url, { headers });

  if (!response.ok) {
    throw new Error(`Failed to fetch price for ${symbol}`);
  }

  const result = v.parse(
    v.object({
      [tokenId]: v.object({ "usd": v.number() }),
    }),
    await response.json(),
  );

  return dn.from(result[tokenId]?.usd ?? 0, 18);
}

const isPool1Symbol = (symbol: string) => {
  return symbol in POOL1_CONFIGS;
}

const getCurvePoolId = (symbol: string) => {
  const config = POOL1_CONFIGS[symbol];
  if (!config) {
    throw new Error(`Unknown pool: ${symbol}`);
  }
  return config.curvePoolId;
}

const fetchCurveLPPrice = async (curvePoolId: string) => {
  const response = await axios.get<CurveAPIPoolsResponse>('https://api.curve.finance/v1/getPools/ethereum/factory-stable-ng');
  const pools = response.data.data.poolData;
  const pool = pools.find((pool) => pool.id === curvePoolId);
  if (!pool) {
    throw new Error(`Curve pool not found: ${curvePoolId}`);
  }
  const usdTotal = parseUnits(pool.usdTotal.toString(), 18);
  return 1000000000000000000n * usdTotal / BigInt(pool.totalSupply);
}

async function fetchPool1LPPrice(symbol: string): Promise<Dnum> {
  const curvePoolId = getCurvePoolId(symbol);
  const price = await fetchCurveLPPrice(curvePoolId);
  return dnum18(price);
}

export const fetchPrice = async (symbol: string, config: ReturnType<typeof useWagmiConfig>) => {
  // LQTY, LUSD = CoinGecko price
  if (symbol === "LQTY" || symbol === "LUSD") {
    return fetchCoinGeckoPrice(symbol);
  }

  // Collateral token = PriceFeed price
  if (isCollateralSymbol(symbol)) {
    return fetchCollateralPrice(symbol, config);
  }

  // BOLD = $1
  if (symbol === BOLD_TOKEN_SYMBOL) {
    return dn.from(1, 18);
  }

  // TODO: DEFI Price
  if (symbol === DEFI.symbol) {
    return dn.from(1, 18);
  }

  if (isPool1Symbol(symbol)) {
    return fetchPool1LPPrice(symbol);
  }

  throw new Error(`Unsupported token: ${symbol}`);
}

export function usePrice(symbol: string | null): UseQueryResult<Dnum> {
  const config = useWagmiConfig();
  return useQuery({
    queryKey: ["usePrice", symbol],
    queryFn: async () => fetchPrice(symbol!, config),
    enabled: symbol !== null,
    refetchInterval: PRICE_REFRESH_INTERVAL,
  });
}
