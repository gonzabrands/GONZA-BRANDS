"use server";

import { redirect } from "next/navigation";
import { signIn, signInAvailable, signOut } from "@/auth";

export async function continueWithGoogle(form: FormData) {
  const role = form.get("role");
  if (role !== "designer" && role !== "business") redirect("/join");
  if (!signInAvailable()) redirect(`/join?role=${role}`);
  await signIn("google", { redirectTo: `/join?role=${role}` });
}

export async function logout() {
  await signOut({ redirectTo: "/" });
}
