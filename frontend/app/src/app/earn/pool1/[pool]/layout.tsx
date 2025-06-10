import { Pool1PoolScreen } from "@/src/screens/Pool1PoolScreen/Pool1PoolScreen";

export function generateStaticParams() {
  return ["DUSD-BOLD", "DUSD-frxUSD"].map(poolId => ({ pool: poolId}));
}

export default function Layout() {
  return <Pool1PoolScreen />;
}
