import { Pool2PositionCard } from "./Pool2PositionCard";
import { css } from "@/styled-system/css";
import { Pool2Position } from "@/src/types";

export function PanelPositions({ positions }: { positions: Pool2Position[] }) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        width: "100%",
        gap: 24,
      }}
    >
      <div
        className={css({
          display: "flex",
          flexDirection: "column",
          gap: 12,
        })}
      >
        {positions.map((position) => (
          <Pool2PositionCard key={position.tokenId} position={position} />
        ))}
        {
          positions.length === 0 && (
            <div
              className={css({
                padding: "20px 24px",
                textAlign: "center",
                background: "secondary",
                borderRadius: 8,
              })}
            >
              No tokens to deposit.
            </div>
          )
        }
      </div>
    </div>
  );
}
