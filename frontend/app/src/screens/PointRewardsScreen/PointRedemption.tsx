"use client";

import * as dn from "dnum";
import { Amount } from "@/src/comps/Amount/Amount";
import { dnum18 } from "@/src/dnum-utils";
import { css } from "@/styled-system/css";
import {
  DEFI,
  Dropdown,
  HFlex,
  InfoTooltip,
  Tabs,
  TokenIcon,
  VFlex,
} from "@liquity2/uikit";
import { ReactNode, useState } from "react";
import { FlowButton, FlowButtonView } from "@/src/comps/FlowButton/FlowButton";
import content from "@/src/content";
import InsufficientFundsModal from "./InsufficientFundsModal";
import { useBreakpoint } from "@/src/breakpoints";
import Link from "next/link";
import { Countdown } from "./Countdown";
import { useOffsetNow } from "./useOffsetNow";
import {
  useDefiSale,
  useDefiSalePersonal,
  useDefiSaleRedemptionCost,
  useDepositsForPoints,
  useUserPoints,
} from "@/src/points-utils";
import { useLiquityStats } from "@/src/liquity-utils";
import { formatDate } from "@/src/formatting";
import { campaignBeginDate, campaignEndDate, useCampaignState } from "./useCampaignState";
import { RewardPoolProgress } from "./RewardPoolProgress";
import { useAccount } from "wagmi";
import {
  DEFI_SALE_PAYMENT_TOKENS,
  DefiSalePaymentToken,
} from "@/src/constants";
import { useErc20TokenBalance } from "@/src/wagmi-utils";
import { VStack } from "@/styled-system/jsx";

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
      {(state === "redeemable" || state === "ended") && <RewardPoolProgress />}
      <RewardsCard />
      {(state === "not-started" || state === "active") && (
        <RedemptionCountdownCard />
      )}
      {(state === "redeemable" || state === "ended") && <RedeemCard />}
    </VFlex>
  );
}

const RewardsCard = () => {
  const { data: defiSale } = useDefiSale();
  const { state, endTime } = useCampaignState();
  const { data: userPoints } = useUserPoints();
  const { data: liquidityStats } = useLiquityStats();
  const lastUpdatedTimestamp =
    liquidityStats != undefined
      ? new Date(liquidityStats.lastUpdatedTimestamp)
      : undefined;
  const showDeFiAmount = state === "redeemable" || state === "ended";
  const defiAmount =
    showDeFiAmount && userPoints !== undefined && defiSale !== undefined
      ? dn.mul(userPoints.totalPoint, defiSale.pointsToDefiRate)
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
            {lastUpdatedTimestamp && (
              <div
                className={css({
                  color: "#aaaaaa",
                  fontSize: 14,
                  fontWeight: 500,
                })}
              >
                updated at {formatDate(lastUpdatedTimestamp)}
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
              <Countdown date={endTime} />
            </span>
          </div>
        )}
      </div>
      {(state === "not-started" || state === "active") && <DepositStats />}
      {state === "redeemable" && (
        <div>
          Redemption ends in <Countdown date={endTime} />
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
  const { address } = useAccount();
  const { state } = useCampaignState();
  const [compact, setCompact] = useState(false);
  useBreakpoint(({ medium }) => {
    setCompact(!medium);
  });
  const proportionOptions = [
    { label: "25%", value: dnum18(250000000000000000n) },
    { label: "50%", value: dnum18(500000000000000000n) },
    { label: "75%", value: dnum18(750000000000000000n) },
    { label: "All", value: dnum18(1000000000000000000n) },
  ];
  const [proportion, setProportion] = useState(proportionOptions[3]!.value);

  const [insufficientFundsModalVisible, setInsufficientFundsModalVisible] =
    useState(false);

  const [selectedPaymentToken, setSelectedPaymentToken] =
    useState<DefiSalePaymentToken>(DEFI_SALE_PAYMENT_TOKENS[0]!);

  const { data: defiSalePersonal, error: errorDefiSalePersonal } =
    useDefiSalePersonal(address);

  const rewardsAmount = defiSalePersonal?.proof?.amount ?? dnum18(0n);
  const redeemedAmount = dnum18(defiSalePersonal?.redeemed ?? 0n);
  const redeemingAmount = dn.mul(
    dn.sub(rewardsAmount, redeemedAmount),
    proportion
  );

  const { data: redemptionCost, error: errorRedemptionCost } =
    useDefiSaleRedemptionCost(redeemingAmount, selectedPaymentToken.address);

  const { data: paymentTokenBalance } = useErc20TokenBalance(
    selectedPaymentToken.address,
    address,
    selectedPaymentToken.decimals
  );

  const insufficientFunds =
    paymentTokenBalance &&
    redemptionCost &&
    dn.lt(paymentTokenBalance, redemptionCost);

  const insufficientUSDFIFunds =
    selectedPaymentToken.symbol === "USDFI" && insufficientFunds;

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
          <RedeemRow label="Payment Token">
            <Dropdown
              items={DEFI_SALE_PAYMENT_TOKENS.map((token) => ({
                label: token.symbol,
              }))}
              menuWidth={100}
              menuPlacement="end"
              onSelect={(index) => {
                setSelectedPaymentToken(DEFI_SALE_PAYMENT_TOKENS[index]!);
              }}
              selected={DEFI_SALE_PAYMENT_TOKENS.findIndex(
                (token) => token === selectedPaymentToken
              )}
              size="small"
            />
          </RedeemRow>
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
              value={redeemingAmount}
              suffix={` ${DEFI.symbol}`}
              fallback="-"
            />
          </RedeemRow>
          <RedeemRow
            label="Redemption cost"
            tooltip={content.pointRewardsScreen.infoTooltips.redemptionCost}
          >
            <VStack alignItems="end" gap={4}>
              <Amount
                value={redemptionCost}
                suffix={` ${selectedPaymentToken.symbol}`}
                fallback="-"
              />
              {insufficientFunds && (
                <span
                  className={css({
                    color: "red:500",
                    fontSize: 14,
                  })}
                >
                  Insufficient balance
                </span>
              )}
            </VStack>
          </RedeemRow>
        </VFlex>
      </VFlex>
      {(errorRedemptionCost || errorDefiSalePersonal) && (
        <div className={css({ color: "red:500" })}>
          {errorRedemptionCost?.message || errorDefiSalePersonal?.message}
        </div>
      )}
      {insufficientUSDFIFunds ? (
        <FlowButtonView
          label="Redeem"
          onClick={() => setInsufficientFundsModalVisible(true)}
          disabled={state !== "redeemable"}
        />
      ) : (
        <FlowButton
          label={state === "ended" ? "Redemption Ended" : "Redeem"}
          request={{
            flowId: "pointsClaimRewards",
            backLink: [`/point-rewards`, `Back to ${DEFI.name} Rewards`],
            successLink: ["/point-rewards", "Go to the Dashboard"],
            successMessage: "The rewards have been claimed successfully.",
            totalRewardsAmount: rewardsAmount,
            proof: defiSalePersonal?.proof?.proof ?? [],
            paymentTokenAddress: selectedPaymentToken.address,
            redeemingAmount,
          }}
          disabled={
            state !== "redeemable" ||
            !redemptionCost ||
            !defiSalePersonal?.proof ||
            dn.eq(redeemingAmount, 0) ||
            !paymentTokenBalance ||
            insufficientFunds
          }
        />
      )}

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
