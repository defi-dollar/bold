import { EarnPoolScreen } from "@/src/screens/EarnPoolScreen/EarnPoolScreen";
import { COLL_SYMBOLS } from "../../../_constants";

export function generateStaticParams() {
  return COLL_SYMBOLS.map((symbol) => ({ pool: symbol.toLowerCase() }));
}

export default async function Layout() {
  return <EarnPoolScreen />;
}
