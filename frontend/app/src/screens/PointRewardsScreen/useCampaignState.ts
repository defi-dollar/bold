// import { useDefiSale } from "@/src/points-utils";
import { useOffsetNow } from "./useOffsetNow";

type CampaignState = "not-started" | "active" | "redeemable" | "ended";

export const campaignBeginDate = new Date("Mon, 04 Aug 2025 00:00:00 GMT");

export const campaignEndDate = new Date(
  campaignBeginDate.getTime() + (28 + 30 * 6) * 24 * 60 * 60 * 1000
);

export const useCampaignState = ():
  | { state: CampaignState; endTime: Date }
  | {
      state: undefined;
      endTime: undefined;
    } => {
  const now = useOffsetNow();
  // const { data: defiSale } = useDefiSale();

  if (now < campaignBeginDate.getTime()) {
    return {
      state: "not-started",
      endTime: campaignBeginDate,
    };
  }

  return {
    state: "active",
    endTime: campaignEndDate,
  };
  // TODO: recover conditions below after campaign deployed

  // if (now < campaignEndDate.getTime()) {
  //   return {
  //     state: "active",
  //     endTime: campaignEndDate,
  //   };
  // }

  // if (!defiSale) {
  //   return {
  //     state: undefined,
  //     endTime: undefined,
  //   };
  // }

  // if (now < defiSale.endTime.getTime()) {
  //   return {
  //     state: "redeemable",
  //     endTime: defiSale.endTime,
  //   };
  // }

  // return {
  //   state: "ended",
  //   endTime: defiSale.endTime,
  // };
};
