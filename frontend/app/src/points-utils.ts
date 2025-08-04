import { useQuery } from "@tanstack/react-query";
import { useAccount } from "wagmi";
import axios, { AxiosError } from "axios";
import * as dn from "dnum";

import {
  getBranch,
  useEarnPositionsByAccount,
  useLiquityStats,
  useLoansByAccount,
} from "./liquity-utils";
import { dnum18 } from "./dnum-utils";
import { useMemo } from "react";
import { COLLATERALS } from "@liquity2/uikit";
import { usePrice } from "./services/Prices";
import { POOL1_CONFIGS } from "./constants";
import { usePool1Deposits } from "./pool1-utils";

export const POINT_SYSTEM_ENABLED = true;

export interface LeaderboardRow {
  rank: number;
  address: `0x${string}`;
  points: number;
}

export const usePointsLeaderboard = () => {
  const { data } = useLiquityStats();
  if (!POINT_SYSTEM_ENABLED) {
    return [];
  }
  return data?.userPointsTop100
    .map<LeaderboardRow>(([address, { totalPoint }], rank) => ({
      rank: rank + 1,
      address,
      points: totalPoint,
    }))
    .slice(0, 20);
};

export interface APIUserPoints {
  crvUsd: number;
  rank: number;
  stabilityUsd: number;
  totalPoint: number;
  troveUsd: number;
}

export const useUserPoints = () => {
  const { address } = useAccount();
  return useQuery({
    queryKey: ["user-points", address],
    queryFn: async () => {
      if (!POINT_SYSTEM_ENABLED) {
        return {
          crvUsd: 0,
          rank: 0,
          stabilityUsd: 0,
          totalPoint: 0,
          troveUsd: 0,
        };
      }
      try {
        const response = await axios.get<APIUserPoints>(
          `https://defi-dollar.github.io/stats/v2/userPoints/${address?.toLowerCase()}.json`
        );
        return response.data;
      } catch (error) {
        if (error instanceof AxiosError) {
          if (error.response?.status === 404) {
            return {
              crvUsd: 0,
              rank: 0,
              stabilityUsd: 0,
              totalPoint: 0,
              troveUsd: 0,
            };
          }
        }
        throw error;
      }
    },
    enabled: !!address,
  });
};

export const useDepositsForPoints = () => {
  const { address } = useAccount();
  const { data: loans } = useLoansByAccount(address);
  const { data: earnPositions } = useEarnPositionsByAccount(address ?? null);

  const collSymbols = COLLATERALS.map((COL) => COL.symbol);
  const collPrices = Object.fromEntries(
    collSymbols.map((symbol) => [symbol, usePrice(symbol)])
  );
  const pool1Deposits = Object.fromEntries(
    Object.keys(POOL1_CONFIGS).map((poolId) => [
      poolId,
      usePool1Deposits(poolId),
    ])
  );

  const collateralDeposits = useMemo(() => {
    if (!loans) return undefined;

    let totalDeposit = dnum18(0);

    for (const loan of loans) {
      const symbol = getBranch(loan.branchId).symbol;
      const collPrice = collPrices[symbol];
      if (!collPrice || collPrice.data === undefined) {
        return undefined;
      }
      totalDeposit = dn.add(totalDeposit, dn.mul(loan.deposit, collPrice.data));
    }

    return totalDeposit;
  }, [loans]);

  const stabilityPoolDeposits = useMemo(() => {
    if (!earnPositions) return undefined;

    return earnPositions.reduce((acc, earnPosition) => {
      return dn.add(acc, earnPosition.deposit);
    }, dnum18(0));
  }, [earnPositions]);

  const pool1DepositsUsd = useMemo(() => {
    let totalDeposit = dnum18(0);
    for (const [_, deposits] of Object.entries(pool1Deposits)) {
      if (!deposits.data) {
        return undefined;
      }
      totalDeposit = dn.add(totalDeposit, deposits.data.depositsUsd);
    }
    return totalDeposit;
  }, [pool1Deposits]);

  const totalDeposits = useMemo(() => {
    if (!stabilityPoolDeposits || !collateralDeposits || !pool1DepositsUsd) {
      return undefined;
    }
    return dn.add(
      stabilityPoolDeposits,
      dn.add(collateralDeposits, pool1DepositsUsd)
    );
  }, [stabilityPoolDeposits, collateralDeposits, pool1DepositsUsd]);

  return {
    totalDeposits,
    stabilityPoolDeposits,
    collateralDeposits,
    pool1Deposits: pool1DepositsUsd,
  };
};

export const pointsRedemptionPrice = dnum18(100000000000000000n); // 0.1 BOLD_TOKEN_SYMBOL per DEFI.name

export const getPointsRedemptionCost = (amount: dn.Dnum) => {
  return dn.mul(amount, pointsRedemptionPrice);
};
