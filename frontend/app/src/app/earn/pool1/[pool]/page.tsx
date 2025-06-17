import { POOL1_POOL_IDS } from "@/src/app/_constants";

export function generateStaticParams() {
  return POOL1_POOL_IDS.map(poolId => ({ pool: poolId}));
}

export default function Pool1PoolPage() {
  return null;
}
