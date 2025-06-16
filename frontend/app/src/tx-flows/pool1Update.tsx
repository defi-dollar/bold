import type { FlowDeclaration } from "@/src/services/TransactionFlow";

import { Amount } from "@/src/comps/Amount/Amount";
import { DNUM_0 } from "@/src/dnum-utils";
import { TransactionDetailsRow } from "@/src/screens/TransactionsScreen/TransactionsScreen";
import { TransactionStatus } from "@/src/screens/TransactionsScreen/TransactionStatus";
import { vDnum, vPositionPool1 } from "@/src/valibot-utils";
import * as dn from "dnum";
import * as v from "valibot";
import { createRequestSchema, verifyTransaction } from "./shared";
import { DEFI } from "@liquity2/uikit";
import { Pool1PositionSummary } from "../comps/Pool1PositionSummary/Pool1PositionSummary";
import { getPool1Contracts } from "../contracts";

const RequestSchema = createRequestSchema(
  "pool1Update",
  {
    poolId: v.string(),
    claimRewards: v.boolean(),
    earnPosition: vPositionPool1(),
    poolDeposit: vDnum(),
    prevEarnPosition: vPositionPool1(),
    prevPoolDeposit: vDnum(),
  },
);

export type Pool1UpdateRequest = v.InferOutput<typeof RequestSchema>;

export const pool1Update: FlowDeclaration<Pool1UpdateRequest> = {
  title: "Review & Send Transaction",

  Summary({ request }) {
    return (
      <Pool1PositionSummary
        poolId={request.poolId}
        earnPosition={{
          ...request.earnPosition,
          rewards: {
            defi: request.claimRewards
              ? DNUM_0
              : request.earnPosition.rewards.defi,
          },
        }}
        poolDeposit={request.poolDeposit}
        prevEarnPosition={dn.eq(request.prevEarnPosition.deposit, 0)
          ? null
          : request.prevEarnPosition}
        prevPoolDeposit={request.prevPoolDeposit}
        txPreviewMode
      />
    );
  },

  Details({ request }) {
    const { earnPosition, prevEarnPosition, claimRewards, poolId } = request;
    const { rewards } = earnPosition;

    const poolName = poolId.replace("-", "/");

    // const boldPrice = usePrice(BOLD_TOKEN_SYMBOL);

    const depositChange = dn.sub(earnPosition.deposit, prevEarnPosition.deposit);

    // const boldAmount = dn.abs(depositChange);
    // const usdAmount = boldPrice.data && dn.mul(boldAmount, boldPrice.data);

    return (
      <>
        <TransactionDetailsRow
          label={dn.gt(depositChange, 0) ? "You deposit" : "You withdraw"}
          value={[
            <Amount
              key="start"
              suffix={` ${poolName} LP`}
              value={dn.abs(depositChange)}
            />,
            // TODO: add USD value
            // <Amount
            //   key="end"
            //   prefix="$"
            //   value={usdAmount}
            // />,
          ]}
        />
        {claimRewards && dn.gt(rewards.defi, 0) && (
          <TransactionDetailsRow
            label={`Claim ${DEFI.name} rewards`}
            value={[
              <Amount
                key="start"
                value={rewards.defi}
                suffix={` ${DEFI.name}`}
              />,
              // TODO: add USD value
              // <Amount
              //   key="end"
              //   value={boldPrice.data && dn.mul(rewards.bold, boldPrice.data)}
              //   prefix="$"
              // />,
            ]}
          />
        )}
      </>
    );
  },

  steps: {
    provideToStabilityPool: {
      name: () => "Deposit",
      Status: TransactionStatus,
      async commit({request, writeContract }) {
        const { earnPosition, prevEarnPosition, claimRewards } = request;
        const contracts = getPool1Contracts(request.poolId);
        const change = earnPosition.deposit[0] - prevEarnPosition.deposit[0];
        return writeContract({
          ...contracts.gauge,
          functionName: "deposit",
          args: [change, earnPosition.owner , claimRewards],
        });
      },
      async verify(ctx, hash) {
        await verifyTransaction(ctx.wagmiConfig, hash, ctx.isSafe);
      },
    },

    withdrawFromStabilityPool: {
      name: () => "Withdraw",
      Status: TransactionStatus,
      async commit({ request, writeContract }) {
        const { earnPosition, prevEarnPosition, claimRewards } = request;
        const change = earnPosition.deposit[0] - prevEarnPosition.deposit[0];
        const contracts = getPool1Contracts(request.poolId);
        return writeContract({
          ...contracts.gauge,
          functionName: "withdraw",
          args: [-change, claimRewards],
        });
      },
      async verify(ctx, hash) {
        await verifyTransaction(ctx.wagmiConfig, hash, ctx.isSafe);
      },
    },
  },

  async getSteps({ request: { earnPosition, prevEarnPosition } }) {
    return dn.gt(earnPosition.deposit, prevEarnPosition.deposit)
      ? ["provideToStabilityPool"]
      : ["withdrawFromStabilityPool"];
  },

  parseRequest(request) {
    return v.parse(RequestSchema, request);
  },
};
