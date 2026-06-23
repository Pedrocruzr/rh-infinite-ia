import { Metadata } from "next";
import { createAdminClient } from "@/lib/supabase/admin";
import { AvaliacaoClientPage } from "./avaliacao-client";

type Props = {
  params: Promise<{ token: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { token } = await params;
  const supabase = createAdminClient();

  const { data: invitation } = await supabase
    .from("assessment_invitations")
    .select("agent_slug, vaga")
    .eq("token", token)
    .maybeSingle();

  const slug = invitation?.agent_slug ?? "teste-perfil-comportamental";
  const vaga = invitation?.vaga;

  let title = "Avaliação de Perfil Comportamental";
  let description = "Responda à sua avaliação comportamental completa na plataforma.";

  if (slug === "teste-perfil-disc") {
    title = "Avaliação de Perfil DISC";
    description = vaga
      ? `Responda à sua avaliação comportamental DISC para a vaga de ${vaga}.`
      : "Responda à sua avaliação comportamental baseada no modelo DISC.";
  } else if (slug === "agente-teste-bigfive") {
    title = "Avaliação de Personalidade Big Five";
    description = vaga
      ? `Responda ao seu inventário de personalidade Big Five para a vaga de ${vaga}.`
      : "Responda ao seu inventário de personalidade baseado no modelo Big Five.";
  } else {
    if (vaga) {
      description = `Responda à sua avaliação comportamental de perfil para a vaga de ${vaga}.`;
    }
  }

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

export default function AvaliacaoPublicaPage() {
  return <AvaliacaoClientPage />;
}
