import { redirect } from "next/navigation";

// Página legada — redireciona para /cotacoes
export default function PrecosRegionaisRedirect() {
  redirect("/cotacoes");
}
