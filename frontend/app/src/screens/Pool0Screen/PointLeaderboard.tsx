import { css } from "@/styled-system/css";
import { shortenAddress, VFlex } from "@liquity2/uikit";
import { useEffect, useState } from "react";
import { useAccount } from "wagmi";

const getRandomRows = (count: number) => {
  return Array.from({ length: count }, (_, i) => ({
    rank: i + 1,
    address: `0x${Math.random().toString(16).slice(2, 18)}` as `0x${string}`,
    points: Math.floor(Math.random() * 1000),
  }));
};

export const PointLeaderboard = () => {
  const { address } = useAccount();
  const [rows, setRows] = useState<{
    rank: number;
    address: `0x${string}`;
    points: number;
  }[]>([]);
  useEffect(() => {
    const newRows = getRandomRows(20);
    if (address) {
      const index = Math.floor(Math.random() * newRows.length);
      newRows[index]!.address = address!;
    }
    setRows(newRows);
  }, [address]);
  
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
          {rows.map((row) => {
            const isCurrentUser = row.address === address;
            return (
              <tr key={row.address} className={css({
                background: isCurrentUser ? "#ffefd0" : "transparent",
              })}>
                <td>{row.rank}</td>
                <td>{isCurrentUser ? 'You' : shortenAddress(address!, 4)}</td>
                <td>{row.points}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </VFlex>
  );
};
