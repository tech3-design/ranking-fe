import { redirect } from "next/navigation";

export default async function PromptsEngineRedirectPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  redirect(`/dashboard/${slug}/prompts/history`);
}
