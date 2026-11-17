"use client";

import { useState } from "react";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

type Role = "designer" | "business";

export default function JoinForm({ initialRole, signedIn, suggestedName, designerSignInPath, businessSignInPath }: {
  initialRole: Role | null;
  signedIn: boolean;
  suggestedName: string;
  designerSignInPath: string;
  businessSignInPath: string;
}) {
  const [role, setRole] = useState<Role | null>(initialRole);
  const [name, setName] = useState(suggestedName);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function register(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!role) return;
    setBusy(true);
    setError("");
    try {
      const response = await fetch("/api/data", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "register", role, name }),
      });
      const result = await response.json() as { error?: string };
      if (!response.ok) throw new Error(result.error ?? "Could not create your workspace.");
      window.location.assign("/");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not create your workspace.");
      setBusy(false);
    }
  }

  return <main className="onboard join-page">
    <Link href="/" className="onboard-head"><span className="brand-icon">G<span>✦</span></span> Gonza<span>Brands</span></Link>
    <div className="onboard-card">
      <span className="eyebrow">WELCOME TO GONZA BRANDS</span>
      <h1>{signedIn && role ? "Finish setting up your workspace" : "How will you use Gonza Brands?"}</h1>
      <p>{signedIn && role ? "Your role is selected. Add your name to get started." : "Choose your role first. We’ll tailor your workspace to the way you work."}</p>
      {(!signedIn || !initialRole) && <div className="role-grid">
        <button type="button" className={`role-card ${role === "designer" ? "selected" : ""}`} onClick={() => setRole("designer")} aria-pressed={role === "designer"}>
          <div className="role-icon">✳</div><strong>I’m a graphic designer</strong><span>Discover briefs, send proposals and manage clients.</span><i>{role === "designer" ? "✓" : ""}</i>
        </button>
        <button type="button" className={`role-card ${role === "business" ? "selected" : ""}`} onClick={() => setRole("business")} aria-pressed={role === "business"}>
          <div className="role-icon">◈</div><strong>I need a designer</strong><span>Find talent, post a brief and build your brand.</span><i>{role === "business" ? "✓" : ""}</i>
        </button>
      </div>}
      {signedIn && initialRole && <div className="chosen-role"><span>{role === "designer" ? "✳" : "◈"}</span><div><strong>{role === "designer" ? "Graphic designer" : "Business / Customer"}</strong><small>Your selected role</small></div><button type="button" onClick={() => { setRole(null); window.location.assign("/join"); }}>Change</button></div>}
      {signedIn ? <form onSubmit={register}>
        <label className="field"><span>{role === "designer" ? "Your full name" : "Business or customer name"}</span><input value={name} onChange={event => setName(event.target.value)} placeholder={role === "designer" ? "e.g. Sarah Namara" : "e.g. Kira Coffee Co."} required minLength={2}/></label>
        {error && <p className="form-notice" role="alert">{error}</p>}
        <button className="button primary wide" disabled={!role || busy}>{busy ? "Creating workspace…" : "Create my workspace"} <ArrowRight size={17}/></button>
      </form> : role ? <a className="button primary wide" href={role === "designer" ? designerSignInPath : businessSignInPath} target="_top">Continue as {role === "designer" ? "a designer" : "a business / customer"} <ArrowRight size={17}/></a> : <button className="button primary wide" disabled>Choose a role to continue <ArrowRight size={17}/></button>}
      {!signedIn && <p className="join-hint">Next, you’ll sign in securely and finish your profile.</p>}
    </div>
    <p className="onboard-foot">A better way to make great work together.</p>
  </main>;
}
