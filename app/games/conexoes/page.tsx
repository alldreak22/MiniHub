import type { Metadata } from "next";
import Conexoes from "./Conexoes";

export const metadata: Metadata = { title: "Conexões" };

export default function GamePage() {
  return <Conexoes />;
}
