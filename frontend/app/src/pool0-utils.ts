import * as dn from "dnum";
import { useQuery } from "@tanstack/react-query";

import { dnum18 } from "./dnum-utils";

export const usePool0Rewards = () => {
  return useQuery({
    queryKey: ["pool0Rewards"],
    queryFn: async () => {
      // TODO: Actual rewards
      return dnum18(1000000000000000000n);
    },
  });
};

export const pool0RedemptionPrice = dnum18(100000000000000000n); // 0.1 BOLD_TOKEN_SYMBOL per DEFI.name

export const getPoolRedemptionCost = (amount: dn.Dnum) => {
  return dn.mul(amount, pool0RedemptionPrice);
};
