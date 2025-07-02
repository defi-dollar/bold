import type { FlowDeclaration } from "@/src/services/TransactionFlow";
import * as dn from "dnum";

import { Amount } from "@/src/comps/Amount/Amount";
import { TransactionDetailsRow } from "@/src/screens/TransactionsScreen/TransactionsScreen";
import { TransactionStatus } from "@/src/screens/TransactionsScreen/TransactionStatus";
import { vDnum } from "@/src/valibot-utils";
import * as v from "valibot";
import { BOLD_TOKEN_SYMBOL, DEFI } from "@liquity2/uikit";
import { createRequestSchema, verifyTransaction } from "./shared";
import { usePrice } from "../services/Prices";
import { dnum18 } from "@/src/dnum-utils";
import { CONTRACT_BOLD_TOKEN } from "../env";
import { erc20Abi } from "viem";
import { getPoolRedemptionCost } from "../pool0-utils";

const RequestSchema = createRequestSchema("pool0ClaimRewards", {
  totalRewardsAmount: vDnum(),
  redemptionProportion: vDnum(),
});

export type Pool0ClaimRewardsRequest = v.InferOutput<typeof RequestSchema>;

export const pool0ClaimRewards: FlowDeclaration<Pool0ClaimRewardsRequest> = {
  title: "Review & Send Transaction",

  Summary() {
    return null;
  },

  Details({ request: { redemptionProportion, totalRewardsAmount } }) {
    const defiToRedeem = dn.mul(redemptionProportion, totalRewardsAmount);
    const boldCost = dn.mul(defiToRedeem, 0.1);
    const { data: defiPrice } = usePrice(DEFI.symbol);
    const { data: boldPrice } = usePrice(BOLD_TOKEN_SYMBOL);

    return (
      <>
        <TransactionDetailsRow
          label="Redemption proportion"
          value={[
            <Amount key="start" percentage value={redemptionProportion} />,
          ]}
        />
        <TransactionDetailsRow
          label={`${DEFI.name} to redeem`}
          value={[
            <Amount
              key="start"
              value={defiToRedeem}
              suffix={` ${DEFI.name}`}
            />,
            defiPrice && (
              <Amount
                key="end"
                value={dn.mul(defiToRedeem, defiPrice)}
                prefix="$"
              />
            ),
          ].filter(Boolean)}
        />
        <TransactionDetailsRow
          label={`${BOLD_TOKEN_SYMBOL} required`}
          value={[
            <Amount
              key="start"
              value={boldCost}
              suffix={` ${BOLD_TOKEN_SYMBOL}`}
            />,
            boldPrice && (
              <Amount
                key="end"
                value={dn.mul(boldCost, boldPrice)}
                prefix="$"
              />
            ),
          ].filter(Boolean)}
        />
      </>
    );
  },

  steps: {
    approveBold: {
      name: () => `Approve ${BOLD_TOKEN_SYMBOL}`,
      Status: TransactionStatus,

      async commit(ctx) {
        const { totalRewardsAmount, redemptionProportion } = ctx.request;
        const defiToRedeem = dn.mul(redemptionProportion, totalRewardsAmount);
        const boldCost = getPoolRedemptionCost(defiToRedeem);

        return ctx.writeContract({
          address: CONTRACT_BOLD_TOKEN,
          abi: erc20Abi,
          functionName: "approve",
          args: [
            CONTRACT_BOLD_TOKEN, // TODO: get the address of the pool0 contract
            boldCost[0],
          ],
        });
      },

      async verify(ctx, hash) {
        await verifyTransaction(ctx.wagmiConfig, hash, ctx.isSafe);
      },
    },

    claimRewards: {
      name: () => "Claim rewards",
      Status: TransactionStatus,

      async commit(ctx) {
        return null;
      },

      async verify(ctx, hash) {
        await verifyTransaction(ctx.wagmiConfig, hash, ctx.isSafe);
      },
    },
  },

  async getSteps(ctx) {
    const {
      readContract,
      account,
      request: { totalRewardsAmount, redemptionProportion },
    } = ctx;
    const defiToRedeem = dn.mul(redemptionProportion, totalRewardsAmount);
    const boldCost = getPoolRedemptionCost(defiToRedeem);

    const allowance = dnum18(
      await readContract({
        address: CONTRACT_BOLD_TOKEN,
        abi: erc20Abi,
        functionName: "allowance",
        args: [account, CONTRACT_BOLD_TOKEN],
      })
    );

    const steps: string[] = [];

    if (dn.lt(allowance, boldCost)) {
      steps.push("approveBold");
    }

    steps.push("claimRewards");

    return steps;
  },

  parseRequest(request) {
    return v.parse(RequestSchema, request);
  },
};
