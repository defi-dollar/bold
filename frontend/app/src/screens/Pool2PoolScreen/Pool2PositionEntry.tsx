import { Amount } from "@/src/comps/Amount/Amount";
import { css } from "@/styled-system/css";
import { BOLD_TOKEN_SYMBOL, Checkbox, TokenIcon } from "@liquity2/uikit";
import { PropsWithChildren } from "react";

export function Pool2PositionEntry({
  selected,
  onSelect,
}: {
  selected: boolean;
  onSelect: (selected: boolean) => void;
}) {
  const active = selected;
  return (
    <div
      className={css({
        cursor: "pointer",
        position: "relative",
        display: "flex",
        flexDirection: "row",
        padding: "12px 16px",
        borderRadius: 8,
        borderWidth: 1,
        borderStyle: "solid",
        width: "100%",
        userSelect: "none",
        alignItems: "center",
        gap: 24,

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
      onClick={() => onSelect(!selected)}
    >
      <Checkbox checked={selected} onChange={onSelect} />
      <TokenIcon symbol={BOLD_TOKEN_SYMBOL} size={34} />
      <div
        className={css({
          display: "flex",
          flexDirection: "column",
          gap: 4,
        })}
      >
        <div
          className={css({
            display: "flex",
            flexDirection: "row",
            gap: 12,
          })}
        >
          <div>DEFI/WETH</div>
          <div className={css({
            display: "flex",
            gap: 4,
          })}>
            <Badge>v3</Badge>
            <Badge>1%</Badge>
          </div>
        </div>
        <Amount
          fallback="…"
          format="compact"
          prefix="$"
          value={[10000000000000000000000n, 18]}
        />
      </div>
    </div>
  );
}

const Badge = ({children} : PropsWithChildren) => {
  return (
    <div className={css({
      fontSize: 12,
      color: "token(colors.green:50)",
      background: "token(colors.green:500)",
      borderRadius: "16px",
      padding: "2px 8px",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    })}>
      {children}
    </div>
  )
}
