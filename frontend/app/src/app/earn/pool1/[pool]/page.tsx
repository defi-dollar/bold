export function generateStaticParams() {
  return ["DUSD-BOLD", "DUSD-frxUSD"].map(poolId => ({ pool: poolId}));
}

export default function Pool1PoolPage() {
  return null;
}
