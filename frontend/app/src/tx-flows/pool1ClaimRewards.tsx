import type { FlowDeclaration } from "@/src/services/TransactionFlow";

import { Amount } from "@/src/comps/Amount/Amount";
import { TransactionDetailsRow } from "@/src/screens/TransactionsScreen/TransactionsScreen";
import { TransactionStatus } from "@/src/screens/TransactionsScreen/TransactionStatus";
import { vPositionPool1 } from "@/src/valibot-utils";
import * as v from "valibot";
import { DEFI } from "@liquity2/uikit";
import { createRequestSchema, verifyTransaction } from "./shared";
import { Pool1PositionSummary } from "../comps/Pool1PositionSummary/Pool1PositionSummary";
import { getPool1Contracts } from "../contracts";
import { DNUM_0 } from "../dnum-utils";

const RequestSchema = createRequestSchema(
  "pool1ClaimRewards",
  {
    earnPosition: vPositionPool1(),
  },
);

export type Pool1ClaimRewardsRequest = v.InferOutput<typeof RequestSchema>;

export const pool1ClaimRewards: FlowDeclaration<Pool1ClaimRewardsRequest> = {
  title: "Review & Send Transaction",

  Summary({ request }) {
    return (
      <Pool1PositionSummary
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
        const { earnPosition } = ctx.request;
        const contracts = getPool1Contracts(earnPosition.poolId);
        return ctx.writeContract({
          ...contracts.gauge,
          functionName: "claim_rewards",
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
