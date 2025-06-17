import { POOL2_POOL_IDS } from "@/src/app/_constants";

export function generateStaticParams() {
  return POOL2_POOL_IDS.map(poolId => ({ pool: poolId}));
}

export default function Pool2PoolPage() {
  return null;
}
