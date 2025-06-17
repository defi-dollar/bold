import { POOL1_POOL_IDS } from "@/src/app/_constants";
import { Pool1PoolScreen } from "@/src/screens/Pool1PoolScreen/Pool1PoolScreen";

export function generateStaticParams() {
  return POOL1_POOL_IDS.map(poolId => ({ pool: poolId}));
}

export default function Layout() {
  return <Pool1PoolScreen />;
}
