import type { Metadata } from "next";
import Cronologia from "../Cronologia";

export const metadata: Metadata = { title: "Resultado de Cronologia" };

export default function ResultPage() {
  return <Cronologia result />;
}
