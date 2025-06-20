import axios from "axios";
import { ReactNode, useCallback, useEffect, useState } from "react";
import { ONBOARD_API_ENDPOINT } from "./constants";
import { OnboardContext, ShowOnboardModalFunction } from "./OnboardContext";
import {
  GetAccountAPIResponse,
  GetSignMessageVersionAPIResponse,
} from "./types";

const getLocalStorageKey = (address: string) =>
  `onboard_signedVersion_${address}`;

type OnboardContextProviderProps = {
  address: string | undefined;
  showOnboardModal: ShowOnboardModalFunction;
  closeOnboardModal: () => void;
  children: ReactNode;
};

export const OnboardProvider = ({
  address,
  showOnboardModal,
  closeOnboardModal,
  children,
}: OnboardContextProviderProps) => {
  const [isOnboarded, setIsOnboarded] = useState<boolean | undefined>(
    undefined,
  );
  const [latestSignMessageVersion, setLatestSignMessageVersion] = useState<
    number | undefined
  >(undefined);

  const _setIsOnboarded = useCallback(
    (version: number) => {
      if (!address) {
        return;
      }
      setIsOnboarded(true);
      localStorage.setItem(
        getLocalStorageKey(address),
        JSON.stringify(version),
      );
    },
    [address],
  );

  // Fetch latest SignMessage version
  useEffect(() => {
    if (latestSignMessageVersion !== undefined) {
      return;
    }

    const load = async () => {
      const version = (
        await axios.get<GetSignMessageVersionAPIResponse>(
          `${ONBOARD_API_ENDPOINT}/signMessageVersion`,
        )
      ).data;

      setLatestSignMessageVersion(version);
    };

    load();
  }, [latestSignMessageVersion]);

  // Always close onboard modal when account changes
  useEffect(() => {
    closeOnboardModal();
  }, [address]);

  // Check should sign from localstorage and API
  useEffect(() => {
    if (!latestSignMessageVersion) {
      return;
    }

    const load = async () => {
      if (!address) {
        setIsOnboarded(false);
        return;
      }

      // set isOnboard to loading state
      setIsOnboarded(undefined);

      // Check localstorage
      const localStorageKey = getLocalStorageKey(address);
      const cachedStr = localStorage.getItem(localStorageKey);
      let cachedValue: number | null = null;

      if (cachedStr !== null) {
        try {
          const parsed = JSON.parse(cachedStr);
          if (typeof parsed === "number") {
            cachedValue = parsed;
          } else {
            localStorage.removeItem(localStorageKey);
          }
        } catch (err) {
          localStorage.removeItem(localStorageKey);
          console.error(err);
        }
      }

      if (cachedValue !== null && cachedValue >= latestSignMessageVersion) {
        setIsOnboarded(true);
        return;
      }

      // Check API
      const { lastSignedVersion } = (
        await axios.get<GetAccountAPIResponse>(
          `${ONBOARD_API_ENDPOINT}/accounts/${address}`,
        )
      ).data;

      if (
        lastSignedVersion !== null &&
        lastSignedVersion >= latestSignMessageVersion
      ) {
        // Update localstorage and setIsOnboard
        _setIsOnboarded(lastSignedVersion);
        return;
      }

      setIsOnboarded(false);
      showOnboardModal();
    };

    load();
  }, [_setIsOnboarded, address, latestSignMessageVersion, showOnboardModal]);

  return (
    <OnboardContext.Provider
      value={{
        isOnboarded,
        showOnboardModal,
        setIsOnboarded: _setIsOnboarded,
      }}
    >
      {children}
    </OnboardContext.Provider>
  );
};
