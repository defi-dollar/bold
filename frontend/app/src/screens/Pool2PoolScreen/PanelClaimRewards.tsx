import type { PositionPool2, TokenSymbol } from "@/src/types";
import type { Dnum } from "dnum";
import { ReactNode } from "react";

import { Amount } from "@/src/comps/Amount/Amount";
import { FlowButton } from "@/src/comps/FlowButton/FlowButton";
import content from "@/src/content";
import { DNUM_0 } from "@/src/dnum-utils";
import { usePrice } from "@/src/services/Prices";
import { useAccount } from "@/src/wagmi-utils";
import { css } from "@/styled-system/css";
import { DEFI, HFlex, TokenIcon, VFlex } from "@liquity2/uikit";
import * as dn from "dnum";

export function PanelClaimRewards({
  poolId,
  position,
}: {
  poolId: string;
  position?: PositionPool2;
}) {
  const account = useAccount();

  // TODO: Price
  const defiPriceUsd = usePrice(DEFI.symbol);

  // TODO: DEFI Price
  const totalRewards =
    defiPriceUsd.data &&
    dn.mul(position?.rewards?.defi ?? DNUM_0, defiPriceUsd.data);

  const allowSubmit = account.isConnected && totalRewards && dn.gt(totalRewards, 0);

  return (
    <VFlex gap={48}>
      <VFlex gap={0}>
        {/* TODO: DEFI Rewards */}
        <Rewards
          amount={position?.rewards?.defi ?? DNUM_0}
          label="Your earnings from protocol distributions to this pool"
          symbol={DEFI.symbol}
        />

        <div
          className={css({
            display: "flex",
            flexDirection: "column",
            gap: 8,
            padding: "24px 0",
            color: "contentAlt",
          })}
        >
          <HFlex justifyContent="space-between" gap={24}>
            <div>{content.earnScreen.rewardsPanel.totalUsdLabel}</div>
            <Amount
              prefix="$"
              value={totalRewards}
              format={2}
            />
          </HFlex>
        </div>
      </VFlex>

      <FlowButton
        disabled={!allowSubmit || !position}
        request={position && {
          flowId: "pool2ClaimRewards",
          backLink: [
            `/earn/pool2/${poolId}`,
            "Back to pool position",
          ],
          successLink: ["/", "Go to the Dashboard"],
          successMessage: "The rewards have been claimed successfully.",
          earnPosition: position,
        }}
      />
    </VFlex>
  );
}

function Rewards({
  amount,
  label,
  symbol,
}: {
  amount: Dnum;
  label: ReactNode;
  symbol: TokenSymbol;
}) {
  return (
    <div
      className={css({
        display: "grid",
        gap: 24,
        medium: {
          gridTemplateColumns: "1.2fr 1fr",
        },
        alignItems: "start",
        padding: "24px 0",
        borderBottom: "1px solid token(colors.separator)",
      })}
    >
      <div>{label}</div>
      <div
        className={css({
          display: "flex",
          justifyContent: "flex-start",
          alignItems: "center",
          gap: 8,
          fontSize: 20,
          medium: {
            justifyContent: "flex-end",
            fontSize: 28,
          },
        })}
      >
        <Amount value={amount} />
        <TokenIcon symbol={symbol} size={24} />
      </div>
    </div>
  );
}
