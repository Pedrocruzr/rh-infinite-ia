import { redirect } from "next/navigation";

export default function TestePerfilRoute() {
  redirect("/cadastro?plan=perfil");
}
