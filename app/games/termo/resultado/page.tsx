import type { Metadata } from "next";
import Termo from "../Termo";

export const metadata: Metadata = { title: "Resultado de Termo" };

export default function ResultPage() {
  return <Termo result />;
}
