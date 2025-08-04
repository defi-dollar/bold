"use client";

import type { BranchId, TokenSymbol } from "@/src/types";

import { EarnPositionSummary } from "@/src/comps/EarnPositionSummary/EarnPositionSummary";
import { SboldPositionSummary } from "@/src/comps/EarnPositionSummary/SboldPositionSummary";
import { LinkTextButton } from "@/src/comps/LinkTextButton/LinkTextButton";
import { Screen } from "@/src/comps/Screen/Screen";
import content from "@/src/content";
import { getBranches, useEarnPosition } from "@/src/liquity-utils";
import { isSboldEnabled, useSboldPosition } from "@/src/sbold";
import { useAccount } from "@/src/wagmi-utils";
import { a, useTransition } from "@react-spring/web";
import { BOLD_TOKEN_SYMBOL, TokenIcon } from "@liquity2/uikit";
import { sortAlphabetically, sortBranches } from "@/src/utils";
import { css } from "@/styled-system/css";

type PoolId = BranchId | "sbold";

export function StabilityPools() {
  const branches = getBranches().sort(sortBranches);
  const collSymbols = branches.map((b) => b.symbol);

  const pools: PoolId[] = branches.map((b) => b.branchId);

  if (isSboldEnabled()) {
    pools.push("sbold");
  }

  const poolsTransition = useTransition(pools, {
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
            {content.earnHome.headline(
              <TokenIcon.Group>
                {[
                  BOLD_TOKEN_SYMBOL,
                  ...collSymbols.sort(sortAlphabetically),
                ].map((symbol) => (
                  <TokenIcon key={symbol} symbol={symbol as TokenSymbol} />
                ))}
              </TokenIcon.Group>,
              <TokenIcon symbol={BOLD_TOKEN_SYMBOL} />
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
            {poolId === "sbold" ? (
              <SboldPool />
            ) : (
              <EarnPool branchId={poolId} />
            )}
          </a.div>
        ))}
      </div>
    </Screen>
  );
}

function EarnPool({ branchId }: { branchId: BranchId }) {
  const account = useAccount();
  const earnPosition = useEarnPosition(branchId, account.address ?? null);
  return (
    <EarnPositionSummary
      branchId={branchId}
      earnPosition={earnPosition.data ?? null}
      linkToScreen
    />
  );
}

function SboldPool() {
  const account = useAccount();
  const sboldPosition = useSboldPosition(account.address ?? null);
  return (
    <SboldPositionSummary
      linkToScreen
      sboldPosition={sboldPosition.data ?? null}
    />
  );
}
