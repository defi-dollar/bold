import axios from "axios";
import { ReactNode, useCallback, useEffect, useState } from "react";
import { ONBOARD_API_ENDPOINT } from "./constants";
import { OnboardContext, ShowOnboardModalFunction } from "./OnboardContext";
import {
  GetAccountAPIResponse,
  GetSignMessageVersionAPIResponse,
} from "./types";

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
  const signMessageVersion = useSignMessageVersion();
  const onboardedVersion = useOnboardedVersion(address, signMessageVersion);

  /** Update isOnboarded and persist onboarded version to localstorage */
  const updateOnboardedVersion = useCallback(
    (version: number) => {
      if (!address) {
        return;
      }
      if (
        onboardedVersion !== undefined &&
        (onboardedVersion === null || version > onboardedVersion)
      ) {
        persistOnboardedVersion(address, version);
      }
      if (signMessageVersion !== undefined && version >= signMessageVersion) {
        setIsOnboarded(true);
      }
    },
    [address, onboardedVersion, setIsOnboarded, signMessageVersion],
  );

  // Close and show onboard modal
  useEffect(() => {
    setIsOnboarded(undefined);
    // Always close onboard modal when dependency changes
    closeOnboardModal();

    if (signMessageVersion === undefined || onboardedVersion === undefined) {
      // fetching data or wallet is not connected
      return;
    }

    // Show onboard modal if not onboarded to latest version
    if (onboardedVersion === null || onboardedVersion < signMessageVersion) {
      setIsOnboarded(false);
      showOnboardModal();
      return;
    }

    setIsOnboarded(true);
  }, [
    signMessageVersion,
    onboardedVersion,
    closeOnboardModal,
    showOnboardModal,
  ]);

  return (
    <OnboardContext.Provider
      value={{
        isOnboarded,
        showOnboardModal,
        updateOnboardedVersion,
      }}
    >
      {children}
    </OnboardContext.Provider>
  );
};

/** Fetch latest SignMessage version from API */
const useSignMessageVersion = () => {
  const [signMessageVersion, setSignMessageVersion] = useState<
    number | undefined
  >(undefined);

  useEffect(() => {
    if (signMessageVersion !== undefined) {
      return;
    }

    const load = async () => {
      const version = (
        await axios.get<GetSignMessageVersionAPIResponse>(
          `${ONBOARD_API_ENDPOINT}/signMessageVersion`,
        )
      ).data;

      setSignMessageVersion(version);
    };

    load();
  }, [signMessageVersion]);

  return signMessageVersion;
};

/** Fetch onboarded version from localstorage or API */
const useOnboardedVersion = (
  address: string | undefined,
  signMessageVersion: number | undefined,
) => {
  const [onboardedVersion, setOnboardedVersion] = useState<
    number | null | undefined
  >(undefined);

  useEffect(() => {
    // Reset onboarded version if dependency changes
    setOnboardedVersion(undefined);

    if (signMessageVersion === undefined || address === undefined) {
      return;
    }

    const load = async () => {
      let persistedValue = getPersistedOnboardedVersion(address);
      if (persistedValue !== null && persistedValue >= signMessageVersion) {
        // Use persisted value, no need to sync from API
        setOnboardedVersion(persistedValue);
        return;
      }

      // Sync from API since persisted value could not be up to date
      const { lastSignedVersion } = (
        await axios.get<GetAccountAPIResponse>(
          `${ONBOARD_API_ENDPOINT}/accounts/${address}`,
        )
      ).data;

      // Persist value from API if it's newer than persisted value
      if (
        lastSignedVersion !== null &&
        (persistedValue === null || lastSignedVersion > persistedValue)
      ) {
        persistOnboardedVersion(address, lastSignedVersion);
        persistedValue = lastSignedVersion;
      }

      setOnboardedVersion(persistedValue);
    };

    load();
  }, [address, signMessageVersion]);

  return onboardedVersion;
};

const getLocalStorageKey = (address: string) =>
  `onboard_signedVersion_${address}`;

const persistOnboardedVersion = (address: string, version: number) => {
  localStorage.setItem(getLocalStorageKey(address), JSON.stringify(version));
};

const getPersistedOnboardedVersion = (address: string) => {
  const localStorageKey = getLocalStorageKey(address);
  const cachedStr = localStorage.getItem(localStorageKey);
  if (cachedStr === null) {
    return null;
  }

  try {
    const parsed = JSON.parse(cachedStr);
    if (typeof parsed === "number") {
      return parsed;
    }
  } catch (err) {
    localStorage.removeItem(localStorageKey);
    console.error(err);
  }

  return null;
};
