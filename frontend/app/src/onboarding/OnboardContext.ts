import { createContext } from "react";

export type ShowOnboardModalFunction = (props?: {
  onSigned?: VoidFunction;
}) => void;

type OnboardContextType = {
  showOnboardModal: ShowOnboardModalFunction;
  setIsOnboarded: (version: number) => void;
  isOnboarded: boolean | undefined;
};

export const OnboardContext = createContext<OnboardContextType>({
  showOnboardModal: () => {},
  isOnboarded: undefined,
  setIsOnboarded: () => {},
});
