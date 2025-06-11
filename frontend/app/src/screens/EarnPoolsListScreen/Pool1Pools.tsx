"use client";

import { LinkTextButton } from "@/src/comps/LinkTextButton/LinkTextButton";
import { Screen } from "@/src/comps/Screen/Screen";
import content from "@/src/content";
import { usePool1Position } from "@/src/liquity-utils";
import { useAccount } from "@/src/wagmi-utils";
import { css } from "@/styled-system/css";
import { DEFI, TokenIcon } from "@liquity2/uikit";
import { a, useTransition } from "@react-spring/web";
import { Pool1PositionSummary } from "@/src/comps/Pool1PositionSummary/Pool1PositionSummary";

const poolIds = ["DUSD-BOLD", "DUSD-frxUSD"];

export function Pool1Pools() {
  const poolsTransition = useTransition(poolIds, {
    from: { opacity: 0, transform: "scale(1.1) translateY(64px)" },
    enter: { opacity: 1, transform: "scale(1) translateY(0px)" },
    leave: { opacity: 0, transform: "scale(1) translateY(0px)" },
    trail: 80,
    config: {
      mass: 1,
      tension: 1800,
      friction: 140,
    },
  });

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
            {content.earnPool1Home.headline(
              <TokenIcon symbol={DEFI.symbol} />,
              "DUSD LP"
            )}
          </div>
        ),
        subtitle: (
          <>
            {content.earnHome.subheading}{" "}
            <LinkTextButton
              label={content.earnHome.learnMore[1]}
              href={content.earnHome.learnMore[0]}
              external
            />
          </>
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
  const earnPosition = usePool1Position(poolId, account.address ?? null);
  return (
    <Pool1PositionSummary
      poolId={poolId}
      earnPosition={earnPosition.data ?? null}
      linkToScreen
    />
  );
}
