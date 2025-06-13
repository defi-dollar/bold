import { Pool2PositionCard } from "./Pool2PositionCard";
import { LinkTextButton } from "@/src/comps/LinkTextButton/LinkTextButton";
import { css } from "@/styled-system/css";
import { HFlex } from "@liquity2/uikit";
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
      </div>
      <CreatePositionLinkButton />
    </div>
  );
}

const CreatePositionLinkButton = () => {
  return (
    <HFlex>
      <LinkTextButton
        label="Create DEFI/WETH Univ3 position"
        href="https://google.com"
        external
      />
    </HFlex>
  );
};
