// import { useDefiSale } from "@/src/points-utils";
import { useOffsetNow } from "./useOffsetNow";

type CampaignState = "not-started" | "active" | "redeemable" | "ended";

export const campaignBeginDate = new Date("Mon, 04 Aug 2025 00:00:00 GMT");

export const campaignEndDate = new Date('Mon Mar 02 2026 00:00:00 GMT+0800 (Taipei Standard Time)');

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
