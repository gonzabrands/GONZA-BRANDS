import { env } from "cloudflare:workers";
import { redirect } from "next/navigation";
import { chatGPTSignInPath, getChatGPTUser } from "../chatgpt-auth";
import JoinForm from "./join-form";

export const dynamic = "force-dynamic";

export default async function Join({ searchParams }: { searchParams: Promise<{ role?: string }> }) {
  const params = await searchParams;
  const initialRole = params.role === "designer" || params.role === "business" ? params.role : null;
  const user = await getChatGPTUser();
  if (user && env.DB) {
    const account = await env.DB.prepare("SELECT id FROM users WHERE id=?").bind(user.userId).first();
    if (account) redirect("/");
  }
  return <JoinForm initialRole={initialRole} signedIn={!!user} suggestedName={user?.fullName ?? ""}
    designerSignInPath={chatGPTSignInPath("/join?role=designer")}
    businessSignInPath={chatGPTSignInPath("/join?role=business")} />;
}
