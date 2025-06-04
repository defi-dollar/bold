import axios from "axios";
import { useContext, useState } from "react";
import { useAccount, useSignMessage } from "wagmi";
import { ONBOARD_API_ENDPOINT } from "./constants";
import { OnboardContext } from "./OnboardContext";
import { GetSignMessageAPIResponse, PostSignatureAPIResponse } from "./types";

export const useOnboardCallback = (callback: VoidFunction) => {
  const { isOnboarded, showOnboardModal } = useContext(OnboardContext);

  return () => {
    if (isOnboarded === undefined) {
      return;
    }
    if (!isOnboarded) {
      showOnboardModal({
        onSigned: callback,
      });
      return;
    }

    callback();
  };
};

export const useSignOnboardMessage = (props?: { onSigned?: VoidFunction }) => {
  const { address } = useAccount();
  const [isFetching, setIsFetching] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const { signMessageAsync, isPending } = useSignMessage();
  const { setIsOnboarded } = useContext(OnboardContext);

  const sign = async () => {
    if (!address) {
      return;
    }

    setIsFetching(true);
    try {
      const {
        data: { message, requestId, version },
      } = await axios.get<GetSignMessageAPIResponse>(
        `${ONBOARD_API_ENDPOINT}/accounts/${address}/message`,
      );

      const signature = await signMessageAsync({ message });

      const {
        data: { success },
      } = await axios.post<PostSignatureAPIResponse>(
        `${ONBOARD_API_ENDPOINT}/accounts/${address}/signature/${requestId}`,
        {
          signature,
        },
      );

      setIsSuccess(success);

      if (success) {
        setIsOnboarded(version);
        props?.onSigned?.();
      }
    } finally {
      setIsFetching(false);
    }
  };

  return {
    isSigning: isFetching || isPending,
    isSuccess,
    sign,
  };
};
