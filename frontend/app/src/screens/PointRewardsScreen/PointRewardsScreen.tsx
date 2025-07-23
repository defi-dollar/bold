"use client";

import { css } from "@/styled-system/css";
import {
  DEFI,
  Tabs,
  VFlex,
} from "@liquity2/uikit";
import { PointRedemption } from "./PointRedemption";
import { PointLeaderboard } from "./PointLeaderboard";
import { useRouter } from "next/navigation";
import { a, useTransition } from "@react-spring/web";

const TABS = [
  { label: "My Points", id: "redemption" },
  { label: "Leaderboard", id: "leaderboard" },
];

export function PointRewardsScreen({
  tab = "redemption",
}: {
  tab?: "redemption" | "leaderboard";
}) {
  const router = useRouter();

  const tabsTransition = useTransition(
    tab,
    {
      from: { opacity: 0, transform: "scale(1.1) translateY(64px)" },
      enter: { opacity: 1, transform: "scale(1) translateY(0px)" },
      leave: { opacity: 0, transform: "scale(1) translateY(0px)" },
      trail: 80,
      config: {
        mass: 1,
        tension: 1800,
        friction: 140,
      },
    }
  );
  
  return (
    <div
      className={css({
        display: "flex",
        flexDirection: "column",
        alignItems: "stretch",
        gap: 24,
        margin: "auto",
        width: "100%",
        maxWidth: 534,
      })}
    >
      <header
        className={css({
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 12,
          paddingBottom: 8,
        })}
      >
        <h1
          className={css({
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: {
              base: 20,
              medium: 28,
            },
          })}
        >
          Point Rewards
        </h1>
        <div
          className={css({
            maxWidth: 540,
            textAlign: "center",
            color: "contentAlt",
          })}
        >
          Manage and claim your {DEFI.name} rewards earned from depositing
          asset.
        </div>
      </header>
      <Tabs
          items={TABS.map(({ label, id }) => ({
            label,
            panelId: `p-${id}`,
            tabId: `t-${id}`,
          }))}
          selected={TABS.findIndex(({ id }) => id === tab)}
          onSelect={(index) => {
            router.push(`/point-rewards/${TABS[index]!.id}`);
          }}
        />

      <VFlex gap={24}>
        {tabsTransition((style, tabId) => ( 
          <a.div style={style}>
            {tabId === "redemption" && <PointRedemption />}
            {tabId === "leaderboard" && <PointLeaderboard />}
          </a.div>
        ))}
      </VFlex>
    </div>
  );
}
