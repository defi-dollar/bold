"use client";

import { POOL2_POOL_IDS } from "@/src/app/_constants";
import { LinkTextButton } from "@/src/comps/LinkTextButton/LinkTextButton";
import { Screen } from "@/src/comps/Screen/Screen";
import content from "@/src/content";
import { useAccount } from "@/src/wagmi-utils";
import { css } from "@/styled-system/css";
import { HFlex, IconInfo, VFlex } from "@liquity2/uikit";
import { a, useTransition } from "@react-spring/web";
import { Pool2PositionSummary } from "@/src/comps/Pool2PositionSummary/Pool2PositionSummary";
import { usePool2Position } from "@/src/pool2-utils";

export function Pool2Pools() {
  const poolsTransition = useTransition(
    POOL2_POOL_IDS,
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
    <Screen
      heading={{
        title: (
          <div
            className={css({
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexFlow: "wrap",
              gap: "0 8px",
            })}
          >
            {content.pool2Pools.headline}
          </div>
        ),
        subtitle: (
          <VFlex gap={16}>
            <div>
              {content.pool2Pools.subheading}{" "}
              <LinkTextButton
                label={content.earnHome.learnMore[1]}
                href={content.earnHome.learnMore[0]}
                external
              />
            </div>
            <HFlex
              justifyContent="start"
              className={css({
                color: "content",
                padding: "12px 20px",
                background: "secondary",
                borderRadius: 8,
                textAlign: "left",
              })}
            >
              <IconInfo size={24} />
              The more the LP concentrates, the more it rewards
            </HFlex>
          </VFlex>
        ),
      }}
    >
      <div
        className={css({
          display: "grid",
          gap: 16,
        })}
      >
        {poolsTransition((style, poolId) => (
          <a.div style={style}>
            <Pool1Pool poolId={poolId} />
          </a.div>
        ))}
      </div>
    </Screen>
  );
}

function Pool1Pool({ poolId }: { poolId: string }) {
  const account = useAccount();
  const earnPosition = usePool2Position(poolId, account.address ?? null);
  return (
    <Pool2PositionSummary
      poolId={poolId}
      earnPosition={earnPosition.data ?? null}
      linkToScreen
    />
  );
}
