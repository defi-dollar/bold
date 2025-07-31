"use client";

import * as dn from "dnum";
import { Amount } from "@/src/comps/Amount/Amount";
import { dnum18 } from "@/src/dnum-utils";
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
import { ReactNode, useState } from "react";
import { FlowButtonView } from "@/src/comps/FlowButton/FlowButton";
import content from "@/src/content";
import InsufficientFundsModal from "./InsufficientFundsModal";
import { useBreakpoint } from "@/src/breakpoints";
import Link from "next/link";
import { Countdown } from "./Countdown";
import { useOffsetNow } from "./useOffsetNow";
import { useDepositsForPoints, useUserPoints } from "@/src/points-utils";

const campaignBeginDate = new Date(Date.now() + 30 * 60 * 60 * 1000);
const campaignEndDate = new Date(
  campaignBeginDate.getTime() + 28 * 24 * 60 * 60 * 1000
);
const redemptionEndDate = new Date(
  campaignEndDate.getTime() + 14 * 24 * 60 * 60 * 1000
);

const useCampaignState = () => {
  const now = useOffsetNow();

  if (now < campaignBeginDate.getTime()) {
    return {
      state: "not-started",
    };
  }

  if (now < campaignEndDate.getTime()) {
    return {
      state: "active",
    };
  }

  if (now < redemptionEndDate.getTime()) {
    return {
      state: "redeemable",
    };
  }

  return {
    state: "ended",
  };
};

const useOverallMultiplier = (beginDate: Date) => {
  const now = useOffsetNow();

  const phase1EndDate = new Date(beginDate.getTime() + 7 * 24 * 60 * 60 * 1000);
  const phase2EndDate = new Date(
    beginDate.getTime() + 14 * 24 * 60 * 60 * 1000
  );
  const phase3EndDate = new Date(
    beginDate.getTime() + 28 * 24 * 60 * 60 * 1000
  );

  if (now < phase1EndDate.getTime()) {
    return {
      multiplier: 3,
      endDate: phase1EndDate,
    };
  }

  if (now < phase2EndDate.getTime()) {
    return {
      multiplier: 2,
      endDate: phase2EndDate,
    };
  }

  if (now < phase3EndDate.getTime()) {
    return {
      multiplier: 1,
      endDate: phase3EndDate,
    };
  }

  return {
    multiplier: 0,
    endDate: phase3EndDate,
  };
};

export function PointRedemption() {
  const { state } = useCampaignState();

  return (
    <VFlex gap={24}>
      <RewardsCard />
      {(state === "not-started" || state === "active") && (
        <RedemptionCountdownCard />
      )}
      {(state === "redeemable" || state === "ended") && <RedeemCard />}
    </VFlex>
  );
}

const RewardsCard = () => {
  const { state } = useCampaignState();
  const { data: userPoints } = useUserPoints();
  const pointsToDeFiRate = [50000000000000000n, 18] as dn.Dnum;
  const showDeFiAmount = state === "redeemable" || state === "ended";
  const defiAmount =
    showDeFiAmount && userPoints !== undefined
      ? dn.mul(userPoints.totalPoint, pointsToDeFiRate)
      : undefined;

  const isStarted = state !== "not-started";

  return (
    <VFlex
      gap={16}
      className={css({
        padding: 24,
        borderRadius: 8,
        borderWidth: 1,
        borderStyle: "solid",
        color: "content",
        background: "infoSurface",
        borderColor: "infoSurfaceBorder",
      })}
    >
      <h2
        className={css({
          fontSize: 16,
          fontWeight: 700,
          color: "content",
        })}
      >
        Point Rewards
      </h2>
      <div
        className={css({
          pl: 24,
        })}
      >
        {isStarted ? (
          <VFlex
            gap={0}
            className={css({
              fontSize: 24,
              fontWeight: 700,
              color: "content",
            })}
          >
            <Amount
              value={userPoints?.totalPoint}
              suffix={` Points`}
              fallback="-"
              format={0}
            />
            {defiAmount !== undefined && (
              <div
                className={css({
                  fontSize: 16,
                  fontWeight: 600,
                  color: "contentAlt",
                })}
              >
                <Amount
                  value={defiAmount}
                  prefix="= "
                  suffix={` ${DEFI.symbol}`}
                  fallback="-"
                  format={0}
                />
              </div>
            )}
          </VFlex>
        ) : (
          <div
            className={css({
              color: "content",
            })}
          >
            Starting in{" "}
            <span
              className={css({
                fontSize: 24,
                fontWeight: 700,
              })}
            >
              <Countdown date={campaignBeginDate} />
            </span>
          </div>
        )}
      </div>
      {(state === "not-started" || state === "active") && <DepositStats />}
      {state === "redeemable" && (
        <div>
          Redemption ends in <Countdown date={redemptionEndDate} />
        </div>
      )}
      {state === "ended" && <div>Redemption ended</div>}
    </VFlex>
  );
};

const DepositStats = () => {
  const { multiplier: overallMultiplier, endDate: overallMultiplierEndDate } =
    useOverallMultiplier(campaignBeginDate);

  const { state } = useCampaignState();
  const isStarted = state !== "not-started";

  const {
    totalDeposits,
    collateralDeposits,
    pool1Deposits,
    stabilityPoolDeposits,
  } = useDepositsForPoints();

  return (
    <VFlex gap={16}>
      <RedeemRow label="Your deposits">
        <Amount
          value={totalDeposits}
          prefix="$"
          fallback="-"
          format="compact"
        />
      </RedeemRow>
      <VFlex
        gap={8}
        className={css({
          pl: 24,
        })}
      >
        <RedeemRow
          label={
            <UnderlineLink
              href="https://www.curve.finance/dex/ethereum/pools/?search=usdfi"
              target="_blank"
            >
              in Curve USDFI LPs
            </UnderlineLink>
          }
          badge="5x"
        >
          <Amount
            value={pool1Deposits}
            prefix="$"
            fallback="-"
            format="compact"
          />
        </RedeemRow>
        <RedeemRow
          label={<UnderlineLink href="/">in collateral</UnderlineLink>}
          badge="2x"
        >
          <Amount
            value={collateralDeposits}
            prefix="$"
            fallback="-"
            format="compact"
          />
        </RedeemRow>
        <RedeemRow
          label={
            <UnderlineLink href="/earn/stability">
              in stability pools
            </UnderlineLink>
          }
          badge="1x"
        >
          <Amount
            value={stabilityPoolDeposits}
            prefix="$"
            fallback="-"
            format="compact"
          />
        </RedeemRow>
      </VFlex>
      {overallMultiplier > 0 && (
        <div
          className={css({
            fontSize: 16,
            fontWeight: 500,
            color: "content",
          })}
        >
          {isStarted ? (
            <>
              Overall multiplier: <Badge>{overallMultiplier}x</Badge> for{" "}
              <Countdown date={overallMultiplierEndDate} />
            </>
          ) : (
            <>
              Overall multiplier: <Badge>{overallMultiplier}x</Badge>
            </>
          )}
        </div>
      )}
    </VFlex>
  );
};

const RedeemCard = () => {
  const { state } = useCampaignState();
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

  const [compact, setCompact] = useState(false);
  useBreakpoint(({ medium }) => {
    setCompact(!medium);
  });

  const [insufficientFundsModalVisible, setInsufficientFundsModalVisible] =
    useState(false);

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
          <RedeemRow label="Redemption proportion" compact={compact}>
            <div>
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
            </div>
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
            tooltip={content.pointRewardsScreen.infoTooltips.redemptionCost}
          >
            <Amount
              value={redemptionCost}
              suffix={` ${BOLD_TOKEN_SYMBOL}`}
              fallback="-"
            />
          </RedeemRow>
        </VFlex>
      </VFlex>
      <FlowButtonView
        label="Redeem"
        onClick={() => setInsufficientFundsModalVisible(true)}
        disabled={state !== "redeemable"}
      />
      {/* <FlowButton
        label="Redeem"
        request={{
          flowId: "pointsClaimRewards",
          backLink: [`/point-rewards`, `Back to ${DEFI.name} Rewards`],
          successLink: ["/", "Go to the Dashboard"],
          successMessage: "The rewards have been claimed successfully.",
          totalRewardsAmount: rewardsAmount,
          redemptionProportion: proportion,
        }}
        disabled={state !== "redeemable"}
      /> */}
      <InsufficientFundsModal
        visible={insufficientFundsModalVisible}
        onClose={() => setInsufficientFundsModalVisible(false)}
      />
    </VFlex>
  );
};

const RedemptionCountdownCard = () => {
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
        })}
      >
        <h2
          className={css({
            fontSize: 16,
            fontWeight: 700,
            color: "content",
          })}
        >
          Redemption
        </h2>
        <HFlex
          justifyContent="start"
          alignItems="center"
          gap={8}
          className={css({
            fontSize: 16,
            fontWeight: 500,
          })}
        >
          <TokenIcon symbol={DEFI.symbol} size={16} /> {DEFI.name} rewards
          redemption starts in <Countdown date={campaignEndDate} />
        </HFlex>
      </VFlex>
      <FlowButtonView label="Redeem" disabled />
    </VFlex>
  );
};

const UnderlineLink = ({
  children,
  href,
  target,
}: {
  children: ReactNode;
  href: string;
  target?: string;
}) => {
  return (
    <Link
      href={href}
      target={target}
      className={css({
        textDecoration: "underline",
      })}
    >
      {children}
    </Link>
  );
};

const Badge = ({ children }: { children: ReactNode }) => {
  return (
    <HFlex
      className={css({
        display: "inline-flex",
        fontSize: 12,
        px: 6,
        h: 18,
        background: "green:500",
        color: "white",
        borderRadius: 16,
      })}
      alignItems="center"
      justifyContent="center"
    >
      {children}
    </HFlex>
  );
};

const RedeemRow = ({
  label,
  children,
  tooltip,
  compact,
  badge,
}: {
  label: ReactNode;
  children: ReactNode;
  tooltip?: string;
  compact?: boolean;
  badge?: ReactNode;
}) => {
  return (
    <div
      className={css({
        display: "flex",
        flexDirection: compact ? "column" : "row",
        justifyContent: "space-between",
        alignItems: compact ? "stretch" : "start",
        columnGap: 24,
        rowGap: 8,
      })}
    >
      <HFlex
        gap={4}
        justifyContent={compact ? "start" : "center"}
        alignItems="center"
      >
        {label}
        {tooltip && <InfoTooltip>{tooltip}</InfoTooltip>}
        {badge && <Badge>{badge}</Badge>}
      </HFlex>
      {children}
    </div>
  );
};
