import type { Metadata } from "next";
import Termo from "./Termo";

export const metadata: Metadata = { title: "Termo" };

export default function GamePage() {
  return <Termo />;
}
