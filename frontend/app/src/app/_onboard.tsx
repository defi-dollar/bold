"use client";

import { ReactNode, useCallback, useState } from "react";
import { OnboardModal } from "../comps/OnboardModal/OnboardModal";
import { ShowOnboardModalFunction } from "../onboarding/OnboardContext";
import { OnboardProvider } from "../onboarding/OnboardProvider";

export const OnboardingProvider = ({ children }: { children: ReactNode }) => {
  const [visible, setVisible] = useState(false);
  const [onSigned, setOnSigned] = useState<VoidFunction | undefined>(undefined);

  const openOnboardModal = useCallback<ShowOnboardModalFunction>((props) => {
    setVisible(true);
    setOnSigned(props?.onSigned);
  }, []);

  const closeOnboardModal = useCallback(() => {
    setVisible(false);
    setOnSigned(undefined);
  }, []);

  return (
    <OnboardProvider showOnboardModal={openOnboardModal} closeOnboardModal={closeOnboardModal}>
      {children}
      <OnboardModal
        visible={visible}
        onClose={closeOnboardModal}
        onSigned={onSigned}
      />
    </OnboardProvider>
  );
};
