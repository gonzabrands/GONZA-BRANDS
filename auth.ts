import { createHash } from "node:crypto";
import NextAuth, { type DefaultSession } from "next-auth";
import Google from "next-auth/providers/google";

declare module "next-auth" {
  interface Session {
    user: { id?: string } & DefaultSession["user"];
  }
}

export function signInAvailable() {
  const databaseUrl = process.env.TURSO_DATABASE_URL;
  return Boolean(
    process.env.AUTH_SECRET && process.env.AUTH_GOOGLE_ID &&
    process.env.AUTH_GOOGLE_SECRET && databaseUrl &&
    (databaseUrl.startsWith("file:") ? !process.env.VERCEL : process.env.TURSO_AUTH_TOKEN),
  );
}

export const { auth, handlers, signIn, signOut } = NextAuth({
  providers: [Google],
  session: { strategy: "jwt" },
  callbacks: {
    signIn({ account, profile }) {
      return account?.provider === "google" && profile?.email_verified === true;
    },
    jwt({ token, account }) {
      if (account?.provider === "google") {
        // Public application IDs should not reveal the Google account subject.
        token.gonzaAccountId = `google_${createHash("sha256").update(account.providerAccountId).digest("hex")}`;
      }
      return token;
    },
    session({ session, token }) {
      if (typeof token.gonzaAccountId === "string") session.user.id = token.gonzaAccountId;
      return session;
    },
  },
});
