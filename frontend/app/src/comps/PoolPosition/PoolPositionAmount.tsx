import type { Dnum } from "@/src/types";
import { fmtnum } from "@/src/formatting";
import { css } from "@/styled-system/css";
import { HFlex, Token, TokenIcon } from "@liquity2/uikit";

type PoolPositionAmountProps = {
  lineThrough?: boolean;
  amount?: Dnum;
  token?: Token;
  prefix?: string;
};

export const PoolPositionAmount = ({
  prefix = "",
  amount,
  token,
  lineThrough = false,
}: PoolPositionAmountProps) => {
  if (!token && !amount) {
    return null;
  }

  const title = (() => {
    if (token && amount) {
      return `${fmtnum(amount, "full")} ${token.name}`;
    }

    if (amount) {
      return fmtnum(amount, "full");
    }

    return token?.name;
  })();

  return (
    <HFlex
      title={title}
      gap={4}
      className={css({
        height: 24,
        fontVariantNumeric: "tabular-nums",
        color: lineThrough ? "contentAlt" : undefined,
        textDecoration: lineThrough ? "line-through" : undefined,
      })}
    >
      {amount && `${prefix}${fmtnum(amount)}`}
      {token && <TokenIcon symbol={token.symbol} size="mini" title={null} />}
    </HFlex>
  );
};
