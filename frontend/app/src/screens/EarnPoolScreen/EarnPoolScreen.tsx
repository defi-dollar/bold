"use client";

import { EarnPosition } from "@/src/comps/EarnPosition/EarnPosition";
import { Screen } from "@/src/comps/Screen/Screen";
import content from "@/src/content";
import { useCollIndexFromSymbol } from "@/src/liquity-utils";
import { useAccount } from "@/src/services/Ethereum";
import { useEarnPosition, useStabilityPool } from "@/src/subgraph-hooks";
import { css } from "@/styled-system/css";
import { isCollateralSymbol, Tabs } from "@liquity2/uikit";
import * as dn from "dnum";
import { useParams, useRouter } from "next/navigation";
import { PanelUpdateDeposit } from "./PanelUpdateDeposit";
import { RewardsPanel as PanelRewards } from "./RewardsPanel";

const TABS = [
  { action: "deposit", label: content.earnScreen.tabs.deposit },
  { action: "claim", label: content.earnScreen.tabs.claim },
] as const;

export function EarnPoolScreen() {
  const router = useRouter();
  const params = useParams();

  const account = useAccount();

  const collateralSymbol = String(params.pool).toUpperCase();
  const isCollSymbolOk = isCollateralSymbol(collateralSymbol);
  const collIndex = useCollIndexFromSymbol(isCollSymbolOk ? collateralSymbol : null);

  const earnPosition = useEarnPosition(account.address, collIndex ?? undefined);
  const stabilityPool = useStabilityPool(collIndex ?? undefined);

  if (!collIndex === null || !isCollSymbolOk) {
    return null;
  }

  const hasDeposit = earnPosition.data?.deposit && dn.gt(earnPosition.data.deposit, 0);

  const tab = TABS.find((tab) => tab.action === params.action) ?? TABS[0];

  return stabilityPool.data && tab && (
    <Screen
      back={{
        href: "/earn",
        label: content.earnScreen.backButton,
      }}
      className={css({
        position: "relative",
      })}
    >
      <EarnPosition
        address={account.address}
        collSymbol={collateralSymbol}
      />
      <div
        className={css({
          display: "flex",
          flexDirection: "column",
          gap: 24,
          width: "100%",
        })}
      >
        {hasDeposit
          ? (
            <Tabs
              selected={TABS.indexOf(tab)}
              onSelect={(index) => {
                router.push(`/earn/${collateralSymbol.toLowerCase()}/${TABS[index].action}`, {
                  scroll: false,
                });
              }}
              items={TABS.map((tab) => ({
                label: tab.label,
                panelId: `panel-${tab.action}`,
                tabId: `tab-${tab.action}`,
              }))}
            />
          )
          : (
            <h1
              className={css({
                fontSize: 24,
              })}
            >
              New Stability Pool deposit
            </h1>
          )}
        {tab.action === "deposit" && (
          <PanelUpdateDeposit
            collIndex={collIndex}
            deposited={stabilityPool.data.totalDeposited ?? dn.from(0, 18)}
            position={earnPosition.data ?? undefined}
          />
        )}
        {tab.action === "claim" && (
          <PanelRewards
            collIndex={collIndex}
            position={earnPosition.data ?? undefined}
          />
        )}
      </div>
    </Screen>
  );
}
