import type { Dnum } from "@/src/types";
import { fmtnum } from "@/src/formatting";
import { css } from "@/styled-system/css";
import { HFlex, Token, TokenIcon } from "@liquity2/uikit";
import { Amount } from "../Amount/Amount";

type PoolPositionAmountProps = {
  lineThrough?: boolean;
  amount?: Dnum;
  token?: Token;
  prefix?: string;
  fallback?: string;
};

export const PoolPositionAmount = ({
  prefix = "",
  fallback,
  amount,
  token,
  lineThrough = false,
}: PoolPositionAmountProps) => {
  const title = (() => {
    if (token && amount) {
      return `${fmtnum(amount, "full")} ${token.name}`;
    } else if (amount) {
      return fmtnum(amount, "full");
    } else if (token) {
      return token.name;
    }
    return undefined
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
      {(amount || fallback) && <Amount value={amount} prefix={prefix} fallback={fallback}/>}
      {token && <TokenIcon symbol={token.symbol} size="mini" title={null} />}
    </HFlex>
  );
};
