import { Pool2PoolScreen } from "@/src/screens/Pool2PoolScreen/Pool2PoolScreen";

export function generateStaticParams() {
  return ['DEFI-WETH'].map(poolId => ({ pool: poolId}));
}

export default function Layout() {
  return <Pool2PoolScreen />;
}
