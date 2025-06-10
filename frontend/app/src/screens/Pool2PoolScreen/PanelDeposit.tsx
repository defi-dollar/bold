import { FlowButton } from "@/src/comps/FlowButton/FlowButton";
import { useAccount } from "@/src/wagmi-utils";
import { useState } from "react";
import { Pool2PositionEntry } from "./Pool2PositionEntry";
import { LinkTextButton } from "@/src/comps/LinkTextButton/LinkTextButton";
import { css } from "@/styled-system/css";
import { HFlex } from "@liquity2/uikit";

export function PanelDeposit() {
  const account = useAccount();

  const positions = [
    {
      id: "1",
    },
    {
      id: "2",
    },
  ];

  const [selections, setSelections] = useState<Set<string>>(new Set());

  const allowSubmit = account.isConnected;

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
          <Pool2PositionEntry
            key={position.id}
            selected={selections.has(position.id)}
            onSelect={(selected) => {
              setSelections((prev) => {
                const newSelections = new Set(prev);
                if (selected) {
                  newSelections.add(position.id);
                } else {
                  newSelections.delete(position.id);
                }
                return newSelections;
              });
            }}
          />
        ))}
      </div>
      <CreatePositionLinkButton />
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          gap: 24,
          width: "100%",
        }}
      >
        <FlowButton disabled={!allowSubmit} request={() => null} />
      </div>
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
