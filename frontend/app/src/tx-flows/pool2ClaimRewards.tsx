import type { FlowDeclaration } from "@/src/services/TransactionFlow";

import { Amount } from "@/src/comps/Amount/Amount";
import { TransactionDetailsRow } from "@/src/screens/TransactionsScreen/TransactionsScreen";
import { TransactionStatus } from "@/src/screens/TransactionsScreen/TransactionStatus";
import { vPositionPool2 } from "@/src/valibot-utils";
import * as v from "valibot";
import { DEFI } from "@liquity2/uikit";
import { createRequestSchema, verifyTransaction } from "./shared";
import { getPool2Contracts } from "../contracts";
import { Pool2PositionSummary } from "../comps/Pool2PositionSummary/Pool2PositionSummary";
import { DNUM_0 } from "../dnum-utils";

const RequestSchema = createRequestSchema(
  "pool2ClaimRewards",
  {
    earnPosition: vPositionPool2(),
  },
);

export type Pool2ClaimRewardsRequest = v.InferOutput<typeof RequestSchema>;

export const pool2ClaimRewards: FlowDeclaration<Pool2ClaimRewardsRequest> = {
  title: "Review & Send Transaction",

  Summary({ request }) {
    return (
      <Pool2PositionSummary
        poolId={request.earnPosition.poolId}
        prevEarnPosition={request.earnPosition}
        earnPosition={{
          ...request.earnPosition,
          rewards: {
            defi: DNUM_0,
          },
        }}
        txPreviewMode
      />
    );
  },

  Details({ request }) {
    return (
      <>
        <TransactionDetailsRow
          label={`Claim ${DEFI.name} rewards`}
          value={[
            <Amount
              key="start"
              value={request.earnPosition.rewards.defi}
              suffix={` ${DEFI.name}`}
            />,
            // TODO: price
            // <Amount
            //   key="end"
            //   value={rewardsCollUsd}
            //   prefix="$"
            // />,
          ]}
        />
      </>
    );
  },

  steps: {
    claimRewards: {
      name: () => "Claim rewards",
      Status: TransactionStatus,

      async commit(ctx) {
        const writeContract = ctx.writeContract;
        const { earnPosition } = ctx.request;
        const contracts = getPool2Contracts();
        return writeContract({
          abi: contracts.distributor.abi,
          address: contracts.distributor.address,
          functionName: "claim",
          args: [
            earnPosition.claimData.users,
            earnPosition.claimData.tokens,
            earnPosition.claimData.amounts,
            earnPosition.claimData.proofs,
          ]
        });
      },

      async verify(ctx, hash) {
        await verifyTransaction(ctx.wagmiConfig, hash, ctx.isSafe);
      },
    },
  },

  async getSteps() {
    return ["claimRewards"];
  },

  parseRequest(request) {
    return v.parse(RequestSchema, request);
  },
};
