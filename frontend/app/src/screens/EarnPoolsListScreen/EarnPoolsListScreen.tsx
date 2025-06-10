"use client";

import { css } from "@/styled-system/css";
import { Tabs } from "@liquity2/uikit";
import { useRouter } from "next/navigation";
import { StabilityPools } from "./StabilityPools";
import { Pool1Pools } from "./Pool1Pools";
import { Pool2Pools } from "./Pool2Pools";

const TABS = [
  { label: "Stability Pool", id: "stability" },
  { label: "Pool1", id: "pool1" },
  { label: "Pool2", id: "pool2" },
];

export function EarnPoolsListScreen({
  pool: pool = "stability",
}: {
  pool?: string;
}) {
  const router = useRouter();

  return (
    <div className={css({
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      gap: 24,
    })}>
      <div
        className={css({
          width: "100%",
          maxWidth: 540,
          margin: "0 auto",
        })}
      >
        <Tabs
          items={TABS.map(({ label, id }) => ({
            label,
            panelId: `p-${id}`,
            tabId: `t-${id}`,
          }))}
          selected={TABS.findIndex(({ id }) => id === pool)}
          onSelect={(index) => {
            const tab = TABS[index];
            if (!tab) {
              throw new Error("Invalid tab index");
            }
            router.push(`/earn/${tab.id}`, { scroll: false });
          }}
        />
      </div>
      {pool === "stability" && <StabilityPools />}
      {pool === "pool1" && <Pool1Pools />}
      {pool === "pool2" && <Pool2Pools />}
    </div>
  );
}
