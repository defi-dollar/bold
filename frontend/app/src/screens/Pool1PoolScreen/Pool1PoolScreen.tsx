"use client";

import { useBreakpointName } from "@/src/breakpoints";
import { Screen } from "@/src/comps/Screen/Screen";
import { ScreenCard } from "@/src/comps/Screen/ScreenCard";
import { Spinner } from "@/src/comps/Spinner/Spinner";
import content from "@/src/content";
import {
  usePool1Pool,
  usePool1Position,
} from "@/src/liquity-utils";
import { useAccount } from "@/src/wagmi-utils";
import { css } from "@/styled-system/css";
import { HFlex, IconEarn, Tabs } from "@liquity2/uikit";
import { a, useTransition } from "@react-spring/web";
import * as dn from "dnum";
import { useParams, useRouter } from "next/navigation";
import { match } from "ts-pattern";
import { Pool1PositionSummary } from "@/src/comps/Pool1PositionSummary/Pool1PositionSummary";
import { PanelUpdateDeposit } from "./PanelUpdateDeposit";
import { PanelClaimRewards } from "./PanelClaimRewards";

const TABS = [
  { action: "deposit", label: content.earnScreen.tabs.deposit },
  { action: "claim", label: "Rewards" },
] as const;

export function Pool1PoolScreen() {
  const params = useParams();

  const tab = TABS.find((tab) => tab.action === params.action) ?? TABS[0];
  if (!tab) {
    throw new Error("Invalid tab action: " + params.action);
  }
  const poolId = params.pool as string;

  const router = useRouter();
  const account = useAccount();

  const earnPosition = usePool1Position(poolId, account.address ?? null);
  const earnPool = usePool1Pool(poolId);

  const loadingState =
    earnPool.isLoading || earnPosition.isLoading ? "loading" : "success";

  const tabsTransition = useTransition(loadingState, {
    from: { opacity: 0 },
    enter: { opacity: 1 },
    leave: { opacity: 0 },
    config: {
      mass: 1,
      tension: 2000,
      friction: 120,
    },
  });

  const breakpointName = useBreakpointName();

  return (
    <Screen
      ready={loadingState === "success"}
      back={{
        href: "/earn/pool1",
        label: content.earnScreen.backButton,
      }}
      heading={
        <ScreenCard
          mode={match(loadingState)
            .returnType<"ready" | "loading">()
            .with("success", () => "ready")
            .with("loading", () => "loading")
            .exhaustive()}
          finalHeight={breakpointName === "large" ? 140 : 248}
        >
          {loadingState === "success" ? (
            <Pool1PositionSummary
              earnPosition={earnPosition.data ?? null}
              poolId={poolId}
            />
          ) : (
            <>
              <div
                className={css({
                  position: "absolute",
                  top: 16,
                  left: 16,
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  textTransform: "uppercase",
                  userSelect: "none",
                  fontSize: 12,
                })}
              >
                <div
                  className={css({
                    display: "flex",
                  })}
                >
                  <IconEarn size={16} />
                </div>
                <HFlex gap={8}>
                  Fetching {params.pool} Stability Pool…
                  <Spinner size={18} />
                </HFlex>
              </div>
            </>
          )}
        </ScreenCard>
      }
      className={css({
        position: "relative",
      })}
    >
      {tabsTransition(
        (style, item) =>
          item === "success" && (
            <a.div
              className={css({
                display: "flex",
                flexDirection: "column",
                gap: 24,
                width: "100%",
              })}
              style={{
                opacity: style.opacity,
              }}
            >
              <Tabs
                selected={TABS.indexOf(tab)}
                onSelect={(index) => {
                  const tab = TABS[index];
                  if (!tab) {
                    throw new Error("Invalid tab index");
                  }
                  router.push(
                    `/earn/pool1/${poolId}/${tab.action}`,
                    {
                      scroll: false,
                    }
                  );
                }}
                items={TABS.map((tab) => ({
                  label: tab.label,
                  panelId: `panel-${tab.action}`,
                  tabId: `tab-${tab.action}`,
                }))}
              />
              {tab.action === "deposit" && (
                <PanelUpdateDeposit
                  poolId={poolId}
                  deposited={earnPool.data?.totalDeposited ?? dn.from(0, 18)}
                  position={earnPosition.data ?? undefined}
                />
              )}
              {tab.action === "claim" && (
                <PanelClaimRewards
                  poolId={poolId}
                  position={earnPosition.data ?? undefined}
                />
              )}
            </a.div>
          )
      )}
    </Screen>
  );
}
