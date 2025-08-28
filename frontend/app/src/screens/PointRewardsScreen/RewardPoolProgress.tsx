import { fmtnum, formatPercentage } from "@/src/formatting";
import { useDefiSale } from "@/src/points-utils";
import { css } from "@/styled-system/css";
import { DEFI, HFlex } from "@liquity2/uikit";
import * as dn from "dnum";

export const RewardPoolProgress = () => {
  const { data: defiSale } = useDefiSale();

  if (!defiSale) {
    return null;
  }
  const { totalSold: distributed, totalPool } = defiSale;
  const remaining = dn.sub(totalPool, distributed);
  const progressDn = dn.div(defiSale.totalSold, defiSale.totalPool);
  const progress = dn.toNumber(progressDn);

  return (
    <div
      className={css({
        background: "green:100",
        display: "flex",
        flexDirection: "column",
        alignItems: "stretch",
        padding: "12px 24px",
        gap: 24,
      })}
    >
      <HFlex justifyContent="space-between">
        <div
          className={css({
            fontWeight: 700,
            color: "content",
          })}
        >
          Reward Pool Progress
        </div>
        <div
          className={css({
            color: "contentAlt",
          })}
        >
          {formatPercentage(progress)} of pool distributed
        </div>
      </HFlex>
      <ProgressBar progress={progress} />
      <HFlex justifyContent="space-between">
        <Stat
          label="Distributed"
          value={`${fmtnum(distributed, "compact")} ${DEFI.symbol}`}
          align="left"
        />
        <Stat
          label="Remaining"
          value={`${fmtnum(remaining, "compact")} ${DEFI.symbol}`}
          align="center"
        />
        <Stat
          label="Total Pool"
          value={`${fmtnum(totalPool, "compact")} ${DEFI.symbol}`}
          align="right"
        />
      </HFlex>
    </div>
  );
};

const ProgressBar = ({ progress }: { progress: number }) => {
  return (
    <div
      className={css({
        background: "white",
        borderRadius: 8,
        height: 12,
        width: "100%",
        overflow: "hidden",
      })}
    >
      <div
        className={css({
          height: "100%",
          width: "100%",
          borderRadius: "4px",
          background: "green:500",
        })}
        style={{
          transform: `translateX(${-(1 - progress) * 100}%)`,
        }}
      />
    </div>
  );
};

const Stat = ({
  label,
  value,
  align = "center",
}: {
  label: string;
  value: string;
  align: "left" | "right" | "center";
}) => {
  return (
    <div
      className={css({
        flex: "0 1 auto",
        display: "flex",
        flexDirection: "column",
        alignItems: align,
        gap: 2,
      })}
    >
      <div
        className={css({
          fontSize: 14,
          fontWeight: 600,
          color: "contentAlt",
        })}
      >
        {label}
      </div>
      <div
        className={css({
          fontSize: 16,
          fontWeight: 700,
          color: "content",
        })}
      >
        {value}
      </div>
    </div>
  );
};
