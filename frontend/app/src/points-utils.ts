import { useQuery } from "@tanstack/react-query";
import { useAccount } from "wagmi";
import axios from "axios";
import * as dn from "dnum";

import { useLiquityStats } from "./liquity-utils";
import { dnum18 } from "./dnum-utils";

export interface LeaderboardRow {
  rank: number;
  address: `0x${string}`;
  points: number;
}

export const usePointsLeaderboard = () => {
  const { data } = useLiquityStats();
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
      const response = await axios.get<APIUserPoints>(
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
