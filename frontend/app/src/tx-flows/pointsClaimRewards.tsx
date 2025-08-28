import type { FlowDeclaration } from "@/src/services/TransactionFlow";
import * as dn from "dnum";

import { Amount } from "@/src/comps/Amount/Amount";
import { TransactionDetailsRow } from "@/src/screens/TransactionsScreen/TransactionsScreen";
import { TransactionStatus } from "@/src/screens/TransactionsScreen/TransactionStatus";
import { vAddress, vDnum } from "@/src/valibot-utils";
import * as v from "valibot";
import { DEFI } from "@liquity2/uikit";
import { createRequestSchema, verifyTransaction } from "./shared";
import { usePrice } from "../services/Prices";
import { erc20Abi } from "viem";
import { useDefiSaleRedemptionCost } from "../points-utils";
import { DEFI_SALE_CONTRACT, DEFI_SALE_CONTRACT_ADDRESS, DEFI_SALE_PAYMENT_TOKENS } from "../constants";

const RequestSchema = createRequestSchema("pointsClaimRewards", {
  totalRewardsAmount: vDnum(),
  redeemingAmount: vDnum(),
  proof: v.array(v.string()),
  paymentTokenAddress: vAddress(),
});

export type PointsClaimRewardsRequest = v.InferOutput<typeof RequestSchema>;

export const pointsClaimRewards: FlowDeclaration<PointsClaimRewardsRequest> = {
  title: "Review & Send Transaction",

  Summary() {
    return null;
  },

  Details({ request: { redeemingAmount, paymentTokenAddress } }) {
    const { data: redemptionCost } = useDefiSaleRedemptionCost(
      redeemingAmount,
      paymentTokenAddress
    );
    const paymentToken = DEFI_SALE_PAYMENT_TOKENS.find(
      (token) => token.address === paymentTokenAddress
    )!;

    const { data: defiPrice } = usePrice(DEFI.symbol);

    return (
      <>
        <TransactionDetailsRow
          label={`${DEFI.name} to redeem`}
          value={[
            <Amount
              key="start"
              value={redeemingAmount}
              suffix={` ${DEFI.name}`}
            />,
            defiPrice && (
              <Amount
                key="end"
                value={dn.mul(redeemingAmount, defiPrice)}
                prefix="$"
              />
            ),
          ].filter(Boolean)}
        />
        <TransactionDetailsRow
          label={`${paymentToken.symbol} required`}
          value={[
            <Amount
              key="start"
              value={redemptionCost}
              suffix={` ${paymentToken.symbol}`}
            />,
          ].filter(Boolean)}
        />
      </>
    );
  },

  steps: {
    approve: {
      name: (ctx) => {
        const paymentToken = DEFI_SALE_PAYMENT_TOKENS.find(
          (token) => token.address === ctx.request.paymentTokenAddress
        )!;
        return `Approve ${paymentToken.symbol}`;
      },
      Status: TransactionStatus,

      async commit(ctx) {
        const {
          paymentTokenAddress,
          redeemingAmount,
        } = ctx.request;

        const cost = await ctx.readContract({
          ...DEFI_SALE_CONTRACT,
          functionName: 'cost',
          args: [redeemingAmount[0], paymentTokenAddress],
        })

        return ctx.writeContract({
          address: paymentTokenAddress,
          abi: erc20Abi,
          functionName: "approve",
          args: [
            DEFI_SALE_CONTRACT_ADDRESS,
            cost,
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
        const {
          totalRewardsAmount,
          paymentTokenAddress,
          redeemingAmount,
          proof,
        } = ctx.request;

        return ctx.writeContract({
          ...DEFI_SALE_CONTRACT,
          functionName: "buy",
          args: [
            redeemingAmount[0],
            totalRewardsAmount[0],
            proof,
            paymentTokenAddress,
          ],
        });
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
      request: { redeemingAmount, paymentTokenAddress },
    } = ctx;
    const cost = await ctx.readContract({
      ...DEFI_SALE_CONTRACT,
      functionName: 'cost',
      args: [redeemingAmount[0], paymentTokenAddress],
    })

    const allowance = await readContract({
      address: paymentTokenAddress,
      abi: erc20Abi,
      functionName: "allowance",
      args: [account, DEFI_SALE_CONTRACT_ADDRESS],
    })

    const steps: string[] = [];

    if (allowance < cost) {
      steps.push("approve");
    }

    steps.push("claimRewards");

    return steps;
  },

  parseRequest(request) {
    return v.parse(RequestSchema, request);
  },
};
