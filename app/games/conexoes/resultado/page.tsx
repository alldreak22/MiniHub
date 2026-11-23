import type { Metadata } from "next";
import Conexoes from "../Conexoes";

export const metadata: Metadata = { title: "Resultado de Conexões" };

export default function ResultPage() {
  return <Conexoes result />;
}
