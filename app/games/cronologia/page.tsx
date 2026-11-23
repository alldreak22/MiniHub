import type { Metadata } from "next";
import Cronologia from "./Cronologia";

export const metadata: Metadata = { title: "Cronologia" };

export default function GamePage() {
  return <Cronologia />;
}
