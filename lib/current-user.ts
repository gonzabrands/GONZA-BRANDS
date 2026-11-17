import { auth, signInAvailable } from "@/auth";
import { getDb } from "@/db";

export async function getSignedInUser() {
  if (!signInAvailable()) return null;
  const session = await auth();
  const account = session?.user;
  if (!account?.id || !account.email) return null;

  const { rows } = await getDb().execute({
    sql: "SELECT user_id FROM legacy_google_accounts WHERE account_id = ?",
    args: [account.id],
  });
  const legacyId = rows[0]?.user_id;

  return {
    userId: typeof legacyId === "string" ? legacyId : account.id,
    email: account.email,
    fullName: account.name ?? "",
  };
}
