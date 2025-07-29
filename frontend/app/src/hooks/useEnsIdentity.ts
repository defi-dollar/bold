import { WALLET_CONNECT_PROJECT_ID } from "@/src/env";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { Address, isAddress } from "viem";

type IdentityResponse = {
  name: string | null;
  avatar: string | null;
};

export const useEnsIdentity = (address: string | undefined) => {
  const { data } = useQuery({
    queryKey: ["ensIdentity", address],
    queryFn: async () => {
      const response = await axios.get<IdentityResponse>(
        `https://rpc.walletconnect.org/v1/identity/${address}?projectId=${WALLET_CONNECT_PROJECT_ID}`,
      );
      return response.data;
    },
    enabled: !!address && isAddress(address as Address),
    staleTime: Infinity,
  });

  return data;
};
