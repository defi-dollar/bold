import { Pool2PositionCard } from "./Pool2PositionCard";
import { css } from "@/styled-system/css";
import { Pool2Position } from "@/src/types";
import { VFlex } from "@liquity2/uikit";
import { FlowButtonView } from "@/src/comps/FlowButton/FlowButton";
import { useParams } from "next/navigation";
import { POOL2_CONFIGS } from "@/src/constants";

export function PanelPositions({ positions }: { positions: Pool2Position[] }) {
  const params = useParams();

  const poolId = params.pool as string;
  const { uniswapPoolUrl } = POOL2_CONFIGS[poolId]!;

  return (
    <VFlex gap={48}>
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
          {positions.length === 0 && (
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
          )}
        </div>
      </div>
      <FlowButtonView
        label={"Add Liquidity"}
        onClick={() => {
          window.open(uniswapPoolUrl);
        }}
      />
    </VFlex>
  );
}
