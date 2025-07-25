import { useQuery } from "@tanstack/react-query";
import { useAccount } from "wagmi";
import axios from "axios";
import * as dn from "dnum";

import { useLiquityStats } from "./liquity-utils";
import { dnum18 } from "./dnum-utils";

export const usePointsLeaderboard = () => {
  const { data: lqtyStats } = useLiquityStats();
  return lqtyStats?.userPointsTop100
    .map(([address, points], rank) => ({
      rank: rank + 1,
      address: address as `0x${string}`,
      points: points as number,
    }))
    .slice(0, 20);
};

export const useUserPoints = () => {
  const { address } = useAccount();
  return useQuery({
    queryKey: ["user-points", address],
    queryFn: async () => {
      const response = await axios.get<{ points: number; rank: number }>(
        `https://defi-dollar.github.io/stats/v2/userPoints/${address?.toLowerCase()}.json`
      );
      return response.data;
    },
    enabled: !!address,
  });
};

export const pointsRedemptionPrice = dnum18(100000000000000000n); // 0.1 BOLD_TOKEN_SYMBOL per DEFI.name

export const getPointsRedemptionCost = (amount: dn.Dnum) => {
  return dn.mul(amount, pointsRedemptionPrice);
};
