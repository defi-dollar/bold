"use client";

import { ReactNode, useCallback, useState } from "react";
import { OnboardModal } from "../comps/OnboardModal/OnboardModal";
import { OpenOnboardModalFunction, OnboardProvider } from 'tos-onboard-provider';
import { useAccount, useSignMessage } from "wagmi";

export const OnboardingProvider = ({ children }: { children: ReactNode }) => {
  const { address } = useAccount();
  const { signMessageAsync } = useSignMessage();
  const [visible, setVisible] = useState(false);
  const [onSigned, setOnSigned] = useState<VoidFunction | undefined>(undefined);

  const openOnboardModal = useCallback<OpenOnboardModalFunction>((props) => {
    setVisible(true);
    setOnSigned(props?.onSigned);
  }, []);

  const closeOnboardModal = useCallback(() => {
    setVisible(false);
    setOnSigned(undefined);
  }, []);

  return (
    <OnboardProvider
      address={address}
      apiEndpoint={process.env.NEXT_PUBLIC_TOS_ONBOARD_API_URL ?? ''}
      openOnboardModal={openOnboardModal}
      closeOnboardModal={closeOnboardModal}
      signMessage={signMessageAsync}
    >
      {children}
      <OnboardModal
        visible={visible}
        onClose={closeOnboardModal}
        onSigned={onSigned}
      />
    </OnboardProvider>
  );
};
