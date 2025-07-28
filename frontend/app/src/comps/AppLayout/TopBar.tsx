"use client";

import type { MenuItem } from "./Menu";

import { Logo } from "@/src/comps/Logo/Logo";
import { Tag } from "@/src/comps/Tag/Tag";
import content from "@/src/content";
import { DEPLOYMENT_FLAVOR } from "@/src/env";
import { css } from "@/styled-system/css";
import {
  IconBorrow,
  IconDashboard,
  IconEarn,
  // IconStake
} from "@liquity2/uikit";
import Link from "next/link";
import { AccountButton } from "./AccountButton";
import { Menu } from "./Menu";
import { MenuDrawerButton } from "./MenuDrawer";
import { LinkTextButton } from "../LinkTextButton/LinkTextButton";
import { Amount } from "../Amount/Amount";
import { useUserPoints } from "@/src/points-utils";

const IconRewards = () => {
  return (
    <div
      className={css({
        transform: "rotate(45deg)",
      })}
    >
      <IconEarn size={24} />
    </div>
  );
};

export function TopBar() {
  const accountPoints = useUserPoints();

  const menuItems: MenuItem[] = [
    [content.menu.dashboard, "/", IconDashboard],
    [content.menu.borrow, "/borrow", IconBorrow],
    [content.menu.earn, "/earn", IconEarn], // TODO: Add icon
    // [content.menu.stake, "/stake", IconStake],
    ["Rewards", "/point-rewards", IconRewards, true],
  ];

  return (
    <div
      className={css({
        position: "relative",
        zIndex: 1,
        height: 72,
      })}
    >
      <div
        className={css({
          position: "relative",
          zIndex: 1,
          display: "grid",
          gridTemplateColumns: {
            base: "auto auto",
            medium: "200px auto auto",
          },
          justifyContent: "space-between",
          gap: 16,
          maxWidth: 1280,
          height: "100%",
          margin: "0 auto",
          padding: {
            base: "16px 12px",
            medium: "16px 24px",
          },
          fontSize: 16,
          fontWeight: 500,
          background: "background",
        })}
      >
        <div
          className={css({
            display: "flex",
            alignItems: "center",
            height: "100%",
          })}
        >
          <Link
            href="/"
            className={css({
              position: "relative",
              display: "flex",
              alignItems: "center",
              gap: 16,
              height: "100%",
              _focusVisible: {
                borderRadius: 4,
                outline: "2px solid token(colors.focused)",
              },
              _active: {
                translate: "0 1px",
              },
            })}
          >
            <div
              className={css({
                flexShrink: 0,
              })}
            >
              <Logo />
            </div>
            <div
              className={css({
                flexShrink: 1,
                overflow: "hidden",
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-start",
                medium: {
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 8,
                },
                whiteSpace: "nowrap",
              })}
            >
              <div>{content.appName}</div>
              {DEPLOYMENT_FLAVOR && (
                <div
                  className={css({
                    display: "grid",
                  })}
                >
                  <Tag
                    size="mini"
                    css={{
                      color: "accentContent",
                      background: "brandCoral",
                      border: 0,
                      textTransform: "uppercase",
                      overflow: "hidden",
                    }}
                  >
                    <div
                      className={css({
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      })}
                    >
                      {DEPLOYMENT_FLAVOR}
                    </div>
                  </Tag>
                </div>
              )}
            </div>
          </Link>
        </div>
        <div
          className={css({
            display: "grid",
            justifyContent: "center",
            hideBelow: "medium",
          })}
        >
          <Menu menuItems={menuItems} />
        </div>
        <div
          className={css({
            display: "grid",
            gridTemplateColumns: "min-content 1fr min-content",
            justifyContent: "end",
            gap: 8,
          })}
        >
          <LinkTextButton
            className={css({
              display: {
                base: "none",
                medium: "flex",
              },
              alignItems: "center",
              justifyContent: "center",
            })}
            href="/point-rewards"
            label={
              accountPoints.data ? (
                <Amount prefix="Points: " value={accountPoints.data.totalPoint} format={0} />
              ) : (
                "Rewards"
              )
            }
          />
          <div
            className={css({
              display: "grid",
              justifyContent: "end",
              width: "100%",
            })}
          >
            <AccountButton />
          </div>
          <div
            className={css({
              display: "grid",
              hideFrom: "large",
            })}
          >
            <MenuDrawerButton menuItems={menuItems} />
          </div>
        </div>
      </div>
    </div>
  );
}
