import type { Dnum } from "@/src/types";
import { fmtnum } from "@/src/formatting";
import { css } from "@/styled-system/css";
import { HFlex, Token, TokenIcon } from "@liquity2/uikit";

type PoolPositionAmountProps = {
  lineThrough?: boolean;
  amount?: Dnum;
  token: Token;
};

export const PoolPositionAmount = ({
  amount,
  token,
  lineThrough = false,
}: PoolPositionAmountProps) => {
  return (
    <HFlex
      title={`${fmtnum(amount, "full")} ${token.name}`}
      gap={4}
      className={css({
        height: 24,
        fontVariantNumeric: "tabular-nums",
        color: lineThrough ? "contentAlt" : undefined,
        textDecoration: lineThrough ? "line-through" : undefined,
      })}
    >
      {amount && fmtnum(amount)}
      {token && <TokenIcon symbol={token.symbol} size="mini" title={null} />}
    </HFlex>
  );
};
