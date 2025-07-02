"use client";

import * as dn from "dnum";
import { Amount } from "@/src/comps/Amount/Amount";
import { dnum18 } from "@/src/dnum-utils";
import { usePrice } from "@/src/services/Prices";
import { css } from "@/styled-system/css";
import {
  BOLD_TOKEN_SYMBOL,
  DEFI,
  HFlex,
  InfoTooltip,
  Tabs,
  TokenIcon,
  VFlex,
} from "@liquity2/uikit";
import { LinkTextButton } from "@/src/comps/LinkTextButton/LinkTextButton";
import { ReactNode, useState } from "react";
import { usePool0Rewards } from "@/src/pool0-utils";
import { FlowButton, FlowButtonView } from "@/src/comps/FlowButton/FlowButton";
import content from "@/src/content";

export function Pool0Screen() {
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
          {DEFI.name} Rewards (Pool0)
        </h1>
        <div
          className={css({
            maxWidth: 540,
            textAlign: "center",
            color: "contentAlt",
          })}
        >
          View, manage and claim your {DEFI.name} rewards earned from depositing asset
          as collateral.
        </div>
      </header>
      <VFlex gap={24}>
        <RewardsCard />
        <RedeemCard />
        {/* <RedeemReadonlyCard /> */}
      </VFlex>
    </div>
  );
}

const RewardsCard = () => {
  const rewardsAmount = dnum18(1000000000000000000n);
  const { data: defiPrice } = usePrice(DEFI.symbol);
  const rewardsValue =
    defiPrice !== undefined ? dn.mul(rewardsAmount, defiPrice) : undefined;

  return (
    <VFlex
      gap={12}
      className={css({
        padding: 24,
        borderRadius: 8,
        borderWidth: 1,
        borderStyle: "solid",
        color: "content",
        background: "infoSurface",
        borderColor: "infoSurfaceBorder",
        minHeight: 180,
      })}
    >
      <h2
        className={css({
          fontSize: 16,
          fontWeight: 700,
          color: "content",
        })}
      >
        {DEFI.name} Rewards
      </h2>
      <HFlex alignItems="start" justifyContent="start">
        <HFlex
          className={css({
            height: 36,
          })}
        >
          <TokenIcon symbol={DEFI.symbol} size={24} />
        </HFlex>
        <VFlex gap={0}>
          <div
            className={css({
              fontSize: 24,
              fontWeight: 700,
              color: "content",
            })}
          >
            <Amount
              value={rewardsValue}
              suffix={` ${DEFI.name}`}
              fallback="-"
            />
          </div>
          <div
            className={css({
              fontSize: 14,
              fontWeight: 400,
              color: "contentAlt",
            })}
          >
            <Amount value={rewardsValue} prefix="$" fallback="-" />
          </div>
        </VFlex>
      </HFlex>
      <div
        className={css({
          fontSize: 16,
          fontWeight: 500,
          color: "content",
        })}
      >
        Reward Distribution in 1 day 12 hours
      </div>
    </VFlex>
  );
};

const RedeemReadonlyCard = () => {
  const { data: rewardsRate } = usePool0Rewards();
  const deposits = dnum18(1000000000000000000n);
  const redemptionCost = dnum18(1000000000000000000n);
  return (
    <VFlex gap={48}>
      <VFlex
        gap={24}
        className={css({
          padding: 24,
          borderRadius: 8,
          borderWidth: 1,
          borderStyle: "solid",
          color: "content",
          background: "infoSurface",
          borderColor: "infoSurfaceBorder",
          minHeight: 180,
        })}
      >
        <h2
          className={css({
            fontSize: 16,
            fontWeight: 700,
            color: "content",
          })}
        >
          Redeem
        </h2>
        <VFlex gap={24}>
          <RedeemRow label="Your deposits">
            <VFlex alignItems="end">
              <Amount value={deposits} prefix="$" fallback="-" />
              <LinkTextButton label="Deposit to earn" href="/" />
            </VFlex>
          </RedeemRow>
          <RedeemRow
            label="Rewards APR"
            tooltip={content.pool0Pools.infoTooltips.rewardAPR}
          >
            <Amount value={rewardsRate} percentage fallback="-" />
          </RedeemRow>
          <RedeemRow
            label="Redemption cost"
            tooltip={content.pool0Pools.infoTooltips.redemptionCost}
          >
            <Amount
              value={redemptionCost}
              suffix={` ${BOLD_TOKEN_SYMBOL}`}
              fallback="-"
            />
          </RedeemRow>
        </VFlex>
      </VFlex>
      <FlowButtonView label="Redeem" disabled />
    </VFlex>
  );
};

const RedeemCard = () => {
  const proportionOptions = [
    { label: "25%", value: dnum18(250000000000000000n) },
    { label: "50%", value: dnum18(500000000000000000n) },
    { label: "75%", value: dnum18(750000000000000000n) },
    { label: "All", value: dnum18(1000000000000000000n) },
  ];
  const [proportion, setProportion] = useState(proportionOptions[3]!.value);
  const rewardsAmount = dnum18(87000000000000000000n);
  const redemptionPrice = dnum18(1000000000000000000n);
  const redemptionCost = dn.mul(
    dn.mul(rewardsAmount, proportion),
    redemptionPrice
  );
  return (
    <VFlex gap={48}>
      <VFlex
        gap={24}
        className={css({
          padding: 24,
          borderRadius: 8,
          borderWidth: 1,
          borderStyle: "solid",
          color: "content",
          background: "infoSurface",
          borderColor: "infoSurfaceBorder",
          minHeight: 180,
        })}
      >
        <h2
          className={css({
            fontSize: 16,
            fontWeight: 700,
            color: "content",
          })}
        >
          Redeem
        </h2>
        <VFlex gap={24}>
          <RedeemRow label="Redemption proportion">
            <Tabs
              compact
              items={proportionOptions.map((option) => ({
                label: option.label,
                panelId: `panel-${option.value}`,
                tabId: `tab-${option.value}`,
              }))}
              onSelect={(index) => {
                setProportion(proportionOptions[index]!.value);
              }}
              selected={proportionOptions.findIndex((option) =>
                dn.eq(option.value, proportion)
              )}
            />
          </RedeemRow>
          <RedeemRow label={`Redemption ${DEFI.name} amount`}>
            <Amount
              value={rewardsAmount}
              suffix={` ${DEFI.symbol}`}
              fallback="-"
            />
          </RedeemRow>
          <RedeemRow
            label="Redemption cost"
            tooltip={content.pool0Pools.infoTooltips.redemptionCost}
          >
            <Amount
              value={redemptionCost}
              suffix={` ${BOLD_TOKEN_SYMBOL}`}
              fallback="-"
            />
          </RedeemRow>
        </VFlex>
      </VFlex>
      <FlowButton
        label="Redeem"
        request={{
          flowId: "pool0ClaimRewards",
          backLink: [`/pool0`, `Back to ${DEFI.name} Rewards`],
          successLink: ["/", "Go to the Dashboard"],
          successMessage: "The rewards have been claimed successfully.",
          totalRewardsAmount: rewardsAmount,
          redemptionProportion: proportion,
        }}
      />
    </VFlex>
  );
};

const RedeemRow = ({
  label,
  children,
  tooltip,
}: {
  label: ReactNode;
  children: ReactNode;
  tooltip?: string;
}) => {
  return (
    <HFlex justifyContent="space-between" alignItems="start" gap={24}>
      <HFlex gap={4}>
        {label}
        {tooltip && <InfoTooltip>{tooltip}</InfoTooltip>}
      </HFlex>
      {children}
    </HFlex>
  );
};
