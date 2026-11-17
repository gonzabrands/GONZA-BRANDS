import { handlers, signInAvailable } from "@/auth";

export const runtime = "nodejs";

function unavailable() {
  return Response.json({ error: "Sign-in is temporarily unavailable." }, { status: 503 });
}

export const GET: typeof handlers.GET = async (request) =>
  signInAvailable() ? handlers.GET(request) : unavailable();

export const POST: typeof handlers.POST = async (request) =>
  signInAvailable() ? handlers.POST(request) : unavailable();
