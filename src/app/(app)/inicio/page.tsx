import { redirect } from "next/navigation";

// Página legada — redireciona para /mercado
export default function InicioPage() {
  redirect("/mercado");
}
