import * as dn from "dnum";

import { dnum18 } from "./dnum-utils";

export const pool0RedemptionPrice = dnum18(100000000000000000n); // 0.1 BOLD_TOKEN_SYMBOL per DEFI.name

export const getPoolRedemptionCost = (amount: dn.Dnum) => {
  return dn.mul(amount, pool0RedemptionPrice);
};
