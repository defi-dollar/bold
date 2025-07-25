import { fmtnum } from "@/src/formatting";
import { usePointsLeaderboard, useUserPoints } from "@/src/points-utils";
import { css } from "@/styled-system/css";
import { shortenAddress, VFlex } from "@liquity2/uikit";
import { useMemo } from "react";
import { isAddressEqual } from "viem";
import { useAccount } from "wagmi";

export const PointLeaderboard = () => {
  const { address } = useAccount();
  const leaderboard = usePointsLeaderboard();
  const { data: userPoints } = useUserPoints();

  const rows = useMemo(() => {
    if (!leaderboard) return;
    const rows = [...leaderboard];

    if (
      userPoints &&
      address &&
      !rows.find((row) => isAddressEqual(row.address, address))
    ) {
      rows[rows.length - 1] = {
        rank: userPoints.rank,
        points: userPoints.points,
        address: address as `0x${string}`,
      };
    }

    return rows;
  }, [leaderboard, userPoints, address]);

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
        Leaderboard
      </h2>
      <table
        className={css({
          width: "calc(100% + 48px)",
          marginInline: "-24px",
          fontSize: 14,
          "& th, & td": {
            fontWeight: "inherit",
            whiteSpace: "nowrap",
          },
          "& th": {
            padding: "12px 16px",
            color: "contentAlt2",
            userSelect: "none",
          },
          "& td": {
            padding: "6px 16px",
            borderTop: "1px solid token(colors.tableBorder)",
          },
          "& th:first-of-type, & td:first-of-type": {
            textAlign: "center",
          },
          "& th:nth-of-type(2), & td:nth-of-type(2)": {
            width: "100%",
            textAlign: "left",
          },
          "& th:nth-of-type(3), & td:nth-of-type(3)": {
            textAlign: "right",
          },
          "& thead tr + tr th": {
            color: "contentAlt2",
          },
        })}
      >
        <thead>
          <tr>
            <th>Rank</th>
            <th>Address</th>
            <th>Points</th>
          </tr>
        </thead>
        <tbody>
          {rows?.map((row) => {
            const isCurrentUser = address && isAddressEqual(row.address, address);
            return (
              <tr
                key={row.address}
                className={css({
                  background: isCurrentUser ? "#ffefd0" : "transparent",
                })}
              >
                <td>{row.rank}</td>
                <td>
                  {isCurrentUser ? "You" : shortenAddress(row.address, 4)}
                </td>
                <td>{fmtnum(row.points, 0)}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </VFlex>
  );
};
