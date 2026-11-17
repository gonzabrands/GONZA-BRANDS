import { redirect } from "next/navigation";
import { signInAvailable } from "@/auth";
import { getDb } from "@/db";
import { getSignedInUser } from "@/lib/current-user";
import JoinForm from "./join-form";

export const dynamic = "force-dynamic";

export default async function Join({ searchParams }: { searchParams: Promise<{ role?: string }> }) {
  const params = await searchParams;
  const initialRole = params.role === "designer" || params.role === "business" ? params.role : null;
  const user = await getSignedInUser();
  if (user) {
    const account = await getDb().execute({ sql: "SELECT id FROM users WHERE id = ?", args: [user.userId] });
    if (account.rows.length) redirect("/");
  }
  return <JoinForm initialRole={initialRole} signedIn={!!user} suggestedName={user?.fullName ?? ""}
    canSignIn={signInAvailable()} />;
}
