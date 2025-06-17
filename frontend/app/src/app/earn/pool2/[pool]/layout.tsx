import { POOL2_POOL_IDS } from "@/src/app/_constants";
import { Pool2PoolScreen } from "@/src/screens/Pool2PoolScreen/Pool2PoolScreen";

export function generateStaticParams() {
  return POOL2_POOL_IDS.map(poolId => ({ pool: poolId}));
}

export default function Layout() {
  return <Pool2PoolScreen />;
}
