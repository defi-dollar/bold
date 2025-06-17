import type { Dnum, PositionPool2 } from "@/src/types";
import type { ReactNode } from "react";
import * as dn from "dnum";

import { Amount } from "@/src/comps/Amount/Amount";
import { TagPreview } from "@/src/comps/TagPreview/TagPreview";
import { isPool2PositionActive, usePool2Pool } from "@/src/liquity-utils";
import { css } from "@/styled-system/css";
import {
  BOLD_TOKEN_SYMBOL,
  DEFI,
  IconArrowRight,
  IconPlus,
  InfoTooltip,
  TokenIcon,
} from "@liquity2/uikit";
import Link from "next/link";
import { DUNE_URL } from "@/src/constants";
import { PoolPositionAmount } from "../PoolPosition/PoolPositionAmount";

export function Pool2PositionSummary({
  poolId,
  earnPosition,
  linkToScreen,
  poolDeposit,
  prevEarnPosition = null,
  title,
  txPreviewMode,
}: {
  poolId: string;
  earnPosition: PositionPool2 | null;
  linkToScreen?: boolean;
  prevEarnPosition?: PositionPool2 | null;
  title?: ReactNode;
  txPreviewMode?: boolean;
} & (
  | { poolDeposit: Dnum; prevPoolDeposit: Dnum }
  | { poolDeposit?: undefined; prevPoolDeposit?: undefined }
)) {
  const poolName = poolId.replace("-", "/");
  const earnPool = usePool2Pool(poolId);

  // The earnUpdate tx flow provides static values
  // for poolDeposit and prevPoolDeposit. If these are
  // not provided, we use the values from the earnPool data.
  if (!poolDeposit) {
    poolDeposit = earnPool.data?.totalDeposited ?? undefined;
  }

  const active = txPreviewMode || isPool2PositionActive(earnPosition);

  return (
    <div
      className={css({
        position: "relative",
        display: "flex",
        flexDirection: "column",
        padding: "12px 16px",
        borderRadius: 8,
        borderWidth: 1,
        borderStyle: "solid",
        width: "100%",
        userSelect: "none",

        "--fg-primary-active": "token(colors.positionContent)",
        "--fg-primary-inactive": "token(colors.content)",

        "--fg-secondary-active": "token(colors.positionContentAlt)",
        "--fg-secondary-inactive": "token(colors.contentAlt)",

        "--border-active":
          "color-mix(in srgb, token(colors.secondary) 15%, transparent)",
        "--border-inactive": "token(colors.infoSurfaceBorder)",

        "--bg-active": "token(colors.position)",
        "--bg-inactive": "token(colors.infoSurface)",
      })}
      style={{
        color: `var(--fg-primary-${active ? "active" : "inactive"})`,
        background: `var(--bg-${active ? "active" : "inactive"})`,
        borderColor: active ? "transparent" : "var(--border-inactive)",
      }}
    >
      <div
        className={css({
          display: "flex",
          alignItems: "center",
          gap: 16,
          paddingBottom: 12,
        })}
        style={{
          borderBottom: `1px solid var(--border-${active ? "active" : "inactive"})`,
        }}
      >
        <div
          className={css({
            flexGrow: 0,
            flexShrink: 0,
            display: "flex",
          })}
        >
          {/* TODO: Pool Icon */}
          <TokenIcon symbol="AAVE" size={34} />
        </div>
        <div
          className={css({
            flexGrow: 1,
            display: "flex",
            justifyContent: "space-between",
          })}
        >
          <div
            className={css({
              display: "flex",
              flexDirection: "column",
            })}
          >
            <div>{title ?? `${poolName} Pool`}</div>
            <div
              className={css({
                display: "flex",
                gap: 4,
                fontSize: 14,
              })}
              style={{
                color: `var(--fg-secondary-${active ? "active" : "inactive"})`,
              }}
            >
              <div>TVL</div>
              <div>
                <Amount
                  fallback="-"
                  format="compact"
                  prefix="$"
                  value={poolDeposit}
                />
              </div>
              <InfoTooltip>Total Value Locked (TVL)</InfoTooltip>
            </div>
          </div>
          <div
            className={css({
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-end",
            })}
          >
            {txPreviewMode ? (
              <TagPreview />
            ) : (
              <>
                <div
                  className={css({
                    display: "flex",
                    gap: 6,
                  })}
                >
                  <div
                    className={css({
                      color: "contentAlt2",
                    })}
                  >
                    APR
                  </div>
                  <div>
                    <Amount
                      fallback="-%"
                      format="1z"
                      percentage
                      value={earnPool.data?.apr}
                    />
                  </div>
                  <InfoTooltip
                    content={{
                      heading: "Current APR",
                      body:
                        "The annualized rate this stability pool’s " +
                        "deposits earned over the last 24 hours.",
                      footerLink: {
                        label: "Check Dune for more details",
                        href: DUNE_URL,
                      },
                    }}
                  />
                </div>
              </>
            )}
          </div>
        </div>
      </div>
      <div
        className={css({
          position: "relative",
          display: "flex",
          gap: 32,
          alignItems: "center",
          justifyContent: "space-between",
          paddingTop: 12,
          height: {
            base: "auto",
            large: 56,
          },
          fontSize: 14,
        })}
      >
        <div
          className={css({
            display: "flex",
            flexDirection: "column",
            gap: 8,
            large: {
              flexDirection: "row",
              gap: 32,
            },
          })}
        >
          <div>
            <div
              style={{
                color: `var(--fg-secondary-${active ? "active" : "inactive"})`,
              }}
            >
              Deposit
            </div>
            <div
              className={css({
                display: "flex",
                alignItems: "center",
                gap: 8,
              })}
            >
              <PoolPositionAmount
                amount={earnPosition?.deposit}
                prefix="$"
                fallback="-"
              />
              {prevEarnPosition &&
                earnPosition &&
                !dn.eq(prevEarnPosition.deposit, earnPosition.deposit) && (
                  <PoolPositionAmount
                    amount={prevEarnPosition.deposit}
                    prefix="$"
                    lineThrough
                  />
                )}
            </div>
          </div>
          <div
            className={css({
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-start",
            })}
          >
            <div
              style={{
                color: `var(--fg-secondary-${active ? "active" : "inactive"})`,
              }}
            >
              Rewards
            </div>
            <div
              className={css({
                display: "flex",
                justifyContent: "flex-start",
                alignItems: "center",
                gap: 8,
                height: 24,
              })}
            >
              <PoolPositionAmount
                amount={active ? earnPosition?.rewards.defi : undefined}
                token={DEFI}
              />
              {prevEarnPosition &&
                earnPosition &&
                !dn.eq(
                  prevEarnPosition.rewards.defi,
                  earnPosition.rewards.defi
                ) && (
                  <PoolPositionAmount
                    amount={prevEarnPosition.rewards.defi}
                    token={DEFI}
                    lineThrough
                  />
                )}
            </div>
          </div>
        </div>

        {linkToScreen && (
          <OpenLink
            active={active}
            path={`/earn/pool2/${poolId}`}
            title={`${active ? "Manage" : "Deposit to"} ${poolName} pool`}
          />
        )}
      </div>
    </div>
  );
}

function OpenLink({
  active,
  path,
  title,
}: {
  active: boolean;
  path: string;
  title: string;
}) {
  return (
    <Link
      title={title}
      href={path}
      className={css({
        position: "absolute",
        inset: "0 -16px -12px auto",
        display: "grid",
        placeItems: {
          base: "end center",
          large: "center",
        },
        padding: {
          base: "16px 12px",
          large: "0 12px 0 24px",
        },
        borderRadius: 8,
        _focusVisible: {
          outline: "2px solid token(colors.focused)",
          outlineOffset: -2,
        },
        _active: {
          translate: "0 1px",
        },

        "& > div": {
          transformOrigin: "50% 50%",
          transition: "scale 80ms",
        },
        _hover: {
          "& > div": {
            scale: 1.05,
          },
        },
      })}
    >
      <div
        className={css({
          display: "grid",
          placeItems: "center",
          width: 34,
          height: 34,
          color: "accentContent",
          background: "accent",
          borderRadius: "50%",
        })}
      >
        {active ? <IconArrowRight size={24} /> : <IconPlus size={24} />}
      </div>
    </Link>
  );
}
