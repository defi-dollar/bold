import { useQuery } from "@tanstack/react-query";
import { useAccount, useConfig, useReadContract } from "wagmi";
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
import { DEFI_SALE_CONTRACT, DEFI_SALE_CONTRACT_ADDRESS, DEFI_SALE_PAYMENT_TOKENS, POOL1_CONFIGS } from "./constants";
import { usePool1Deposits } from "./pool1-utils";
import { readContract, readContracts } from "wagmi/actions";
import { DefiSale } from "./abi/DefiSale";
import { StandardMerkleTree } from "@openzeppelin/merkle-tree";
import { pointsRedemptionTree } from "./points-redemption-tree";
import { Address } from "viem";

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

const getPointsRedemptionProof = (address: Address) => {
  const tree = StandardMerkleTree.load(pointsRedemptionTree);
  for (const [i, v] of tree.entries()) {
    if (v[0] === address) {
      return {
        leaf: v,
        proof: tree.getProof(i),
        amount: dnum18(v[1])!,
      };
    }
  }
  return null;
};

export const useDefiSale = () => {
  const wagmiConfig = useConfig();

  const defiSaleContract = {
    address: DEFI_SALE_CONTRACT_ADDRESS,
    abi: DefiSale,
  } as const;

  return useQuery({
    queryKey: ["useDefiSale"],
    queryFn: async () => {
      const [price, endTime, _totalSold] = await readContracts(wagmiConfig, {
        allowFailure: false,
        contracts: [
          {
            ...defiSaleContract,
            functionName: "price",
          },
          {
            ...defiSaleContract,
            functionName: "endTime",
          },
          {
            ...defiSaleContract,
            functionName: "totalSold",
          },
        ],
      });

      return {
        price,
        endTime: new Date(Number(endTime) * 1000),
        totalSold: dnum18(_totalSold),
        totalPool: dnum18(40000000000000000000000000n),
        pointsToDefiRate: dnum18(9618476676333518000n),
      };
    },
  });
};

export const useDefiSalePersonal = (address: Address | undefined) => {
  const wagmiConfig = useConfig();

  return useQuery({
    queryKey: ["useDefiSalePersonal", address],
    queryFn: async () => {
      if (!address) {
        return {
          redeemed: undefined,
          proof: undefined,
        };
      }

      const redeemed = await readContract(wagmiConfig, {
        ...DEFI_SALE_CONTRACT,
        functionName: "bought",
        args: [address],
      });

      const proof = getPointsRedemptionProof(address);

      return {
        redeemed,
        proof,
      }
    },
  });
};

export const useDefiSaleRedemptionCost = (amount: dn.Dnum, paymentTokenAddress: Address) => {
  const paymentToken = getDefiSalePaymentToken(paymentTokenAddress);
  return useReadContract({
    ...DEFI_SALE_CONTRACT,
    functionName: 'cost',
    args: [amount[0], paymentTokenAddress],
    query: {
      select: (result) => {
        return [result, paymentToken.decimals] as dn.Dnum;
      }
    }
  })
}

export const getDefiSalePaymentToken = (address: Address) => {
  return DEFI_SALE_PAYMENT_TOKENS.find(
    (token) => token.address === address
  )!;
}
