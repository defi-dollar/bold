import * as dn from "dnum";
import { useQuery, UseQueryResult } from "@tanstack/react-query";
import axios from "axios";
import { parseUnits, isAddressEqual, Address } from "viem";
import { MERKL_API_URL, DEFI_DOLLAR_API_URL, POOL2_CONFIGS } from "./constants";
import { dnum18 } from "./dnum-utils";
import {
  MerklAPIOpportunity,
  PositionPool2,
  DefiDollarAPIPool2Positions,
  MerklAPIUserRewards,
  Pool2Position,
  Pool2ClaimData,
  Pool2Breakdown,
} from "./types";

export function isPool2PositionActive(position: PositionPool2 | null) {
  return Boolean(
    position && (dn.gt(position.deposit, 0) || dn.gt(position.rewards.defi, 0))
  );
}

export function usePool2Pool(poolId: string) {
  return useQuery({
    queryKey: ["pool2Pool", poolId],
    queryFn: async () => {
      const { opportunityId } = POOL2_CONFIGS[poolId]!;
      const {
        data: { apr, tvl },
      } = await axios.get<MerklAPIOpportunity>(
        `${MERKL_API_URL}/opportunities/${opportunityId}`
      );
      return {
        apr: dnum18(parseUnits(String(apr / 100), 18)),
        totalDeposited: dnum18(parseUnits(String(tvl), 18)),
      };
    },
  });
}

export function usePool2Position(
  poolId: string,
  account: null | Address
): UseQueryResult<PositionPool2 | null> {
  return useQuery<PositionPool2>({
    queryKey: ["pool2Position", poolId, account],
    queryFn: async () => {
      if (!account) {
        throw new Error("Account is required");
      }
      const { uniswapPoolId, rewardToken } = POOL2_CONFIGS[poolId]!;
      const { data: positionsData } =
        await axios.get<DefiDollarAPIPool2Positions>(
          `${DEFI_DOLLAR_API_URL}/positions?account=${account}&chainId=1&poolId=${uniswapPoolId}`
        );
      const { data: rewardsData } = await axios.get<MerklAPIUserRewards>(
        `${MERKL_API_URL}/users/${account}/rewards?chainId=1&claimableOnly=true&breakdownPage=0`
      );

      const activePositions = positionsData.filter(
        (position) => position.status !== "closed"
      );

      let deposit = 0n;

      for (const position of activePositions) {
        deposit += parseUnits(position.amountUSD, 18);
      }

      const pool2Positions: Pool2Position[] = activePositions.map(
        (position) => {
          return {
            type: "v4",
            feeTier: position.feeTier,
            amountUSD: dnum18(parseUnits(position.amountUSD, 18)),
            tokenId: position.tokenId,
            lpToken: {
              symbol: `${position.token0.symbol}/${position.token1.symbol}`,
            },
          };
        }
      );

      let totalRewardsAmount = 0n;
      const claimData: Pool2ClaimData = {
        users: [],
        tokens: [],
        amounts: [],
        proofs: [],
      };

      const breakdownMap = new Map<string, Pool2Breakdown>();

      for (const rewardData of rewardsData) {
        for (const reward of rewardData.rewards) {
          if (reward.token.address !== rewardToken) {
            continue;
          }
          const claimableAmount =
            BigInt(reward.amount) - BigInt(reward.claimed);
          if (claimableAmount === 0n) {
            continue;
          }
          if (!isAddressEqual(reward.recipient, account)) {
            continue;
          }
          if(!isAddressEqual(reward.token.address, rewardToken)) {
            continue;
          }
          totalRewardsAmount += claimableAmount;

          // Prepare claim data
          claimData.users.push(reward.recipient);
          claimData.tokens.push(reward.token.address);
          claimData.amounts.push(claimableAmount);
          claimData.proofs.push(reward.proofs);

          // Prepare breakdowns
          for (const breakdown of reward.breakdowns) {
            const breakdownAmount = dnum18(breakdown.amount);
            const breakdownClaimedAmount = dnum18(breakdown.claimed);
            const breakdownClaimableAmount =
              dn.sub(breakdownAmount, breakdownClaimedAmount);

            if (dn.eq(breakdownClaimableAmount, 0)) {
              continue;
            }

            // Aggregate breakdowns by poolId and fallback to campaignId
            const [protocol, poolId] = breakdown.reason.split("_");
            const key = poolId ?? breakdown.campaignId;
            let entry: Pool2Breakdown;
            if (!breakdownMap.has(key)) {
              entry = {
                poolId: poolId,
                protocol: protocol,
                campaignId: breakdown.campaignId,
                amount: dnum18(0),
                token: {
                  address: reward.token.address,
                  symbol: reward.token.symbol,
                },
              };
              breakdownMap.set(key, entry);
            } else {
              entry = breakdownMap.get(key)!;
            }
            entry.amount = dn.add(entry.amount, breakdownClaimableAmount);
          }
        }
      }
      return {
        type: "pool2",
        owner: account,
        poolId,
        deposit: dnum18(deposit),
        rewards: {
          defi: dnum18(totalRewardsAmount),
        },
        positions: pool2Positions,
        claimData,
        breakdowns: Array.from(breakdownMap.values()),
      };
    },
    enabled: Boolean(account),
  });
}
