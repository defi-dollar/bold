import type {
  PositionPool1,
} from "@/src/types";
import type { Address } from "@liquity2/uikit";
import type { UseQueryResult } from "@tanstack/react-query";

import { getPool1Contracts } from "@/src/contracts";
import { dnum18 } from "@/src/dnum-utils";
import { DEFI } from "@liquity2/uikit";
import { useQuery } from "@tanstack/react-query";
import * as dn from "dnum";
import { useConfig as useWagmiConfig } from "wagmi";
import { readContract } from "wagmi/actions";
import { fetchPrice, usePrice } from "./services/Prices";

export function isPool1PositionActive(position: PositionPool1 | null) {
  return Boolean(
    position && (
      dn.gt(position.deposit, 0)
      || dn.gt(position.rewards.defi, 0)
    ),
  );
}

export function usePool1Pool(poolId: string) {
  const wagmiConfig = useWagmiConfig();
  const {data: lpTokenPrice} = usePrice(poolId);
  
  return useQuery({
    queryKey: [
      "usePool1Pool",
      poolId,
    ],
    queryFn: async () => {
      const pool1Contracts = getPool1Contracts(poolId);

      const rewardTokenPrice = await fetchPrice(DEFI.symbol, wagmiConfig);
      const lpTokenPrice = await fetchPrice(poolId, wagmiConfig);

      const totalSupply = await readContract(wagmiConfig, {
        ...pool1Contracts.gauge,
        functionName: "totalSupply",
      });
      const {rate: rewardRate} = await readContract(wagmiConfig, {
        ...pool1Contracts.gauge,
        functionName: 'reward_data',
        args: [pool1Contracts.rewardToken.address],
      });
      const apr =
        rewardRate * 365n * 24n * 60n * 60n * 1000000000000000000n * rewardTokenPrice[0] / lpTokenPrice[0] / totalSupply;

      return {
        apr: dnum18(apr),
        totalSupply: dnum18(totalSupply),
      };
    },
    select: (data) => {
      return {
        ...data,
        totalDeposited: lpTokenPrice ? dn.multiply(data.totalSupply, lpTokenPrice) : undefined,
      }
    }
  });
}

export function usePool1Position(
  poolId: string,
  account: null | Address,
): UseQueryResult<PositionPool1 | null> {
  const wagmiConfig = useWagmiConfig();
  return useQuery<PositionPool1>({
    queryKey: [
      "pool1Position",
      poolId,
      account,
    ],
    queryFn: async () => {
      if (!account) {
        throw new Error("Account is required");
      }
      const pool1Contracts = getPool1Contracts(poolId);
      const balance = await readContract(wagmiConfig, {
        ...pool1Contracts.gauge,
        functionName: "balanceOf",
        args: [account],
      });
      const defiRewards = await readContract(wagmiConfig, {
        ...pool1Contracts.gauge,
        functionName: 'claimable_reward',
        args: [account, pool1Contracts.rewardToken.address],
      });
      return {
        type: "pool1",
        owner: account,
        poolId,
        deposit: dnum18(balance),
        rewards: {
          defi: dnum18(defiRewards),
        }
      }
    },
    enabled: Boolean(account),
    placeholderData: (previousData) => {
      return previousData;
    }
  });
}
