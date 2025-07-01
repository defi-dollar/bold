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
