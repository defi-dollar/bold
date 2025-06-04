"use client";

import { ReactNode, useCallback, useState } from "react";
import { OnboardModal } from "../comps/OnboardModal/OnboardModal";
import { ShowOnboardModalFunction } from "../onboarding/OnboardContext";
import { OnboardProvider } from "../onboarding/OnboardProvider";

export const OnboardingProvider = ({ children }: { children: ReactNode }) => {
  const openOnboardModal = useCallback<ShowOnboardModalFunction>((props) => {
    setVisible(true);
    setOnSigned(props?.onSigned);
  }, []);

  const [visible, setVisible] = useState(false);
  const [onSigned, setOnSigned] = useState<VoidFunction | undefined>(undefined);

  return (
    <OnboardProvider showOnboardModal={openOnboardModal}>
      {children}
      <OnboardModal
        visible={visible}
        onClose={() => setVisible(false)}
        onSigned={onSigned}
      />
    </OnboardProvider>
  );
};
