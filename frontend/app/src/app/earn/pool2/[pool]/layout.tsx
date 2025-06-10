import { Pool2PoolScreen } from "@/src/screens/Pool2PoolScreen/Pool2PoolScreen";
import { COLL_SYMBOLS } from "../../../_constants";

export function generateStaticParams() {
  return COLL_SYMBOLS.map(symbol => ({ pool: symbol.toLowerCase()}));
}

export default function Layout() {
  return <Pool2PoolScreen />;
}
