import { getSignedInUser } from "@/lib/current-user";
import Workspace from "./workspace";

export const dynamic = "force-dynamic";

export default async function Home() {
  const user = await getSignedInUser();
  if (user) return <Workspace />;
  return (
    <main className="welcome">
      <div className="welcome-inner">
        <div className="wordmark"><span className="brand-icon">G<span>✦</span></span> Gonza<span className="brand-accent">Brands</span></div>
        <div className="welcome-copy">
          <span className="eyebrow">THE CREATIVE CONNECTION</span>
          <h1>Great brands begin with the right people.</h1>
          <p>A focused space where businesses find talented graphic designers, share briefs and build something worth remembering.</p>
          <a className="button primary large" href="/join">Get started <span>↗</span></a>
        </div>
        <div className="welcome-art">
          <div className="art-card art-one"><span>01 / DISCOVER</span><strong>Find your creative match</strong><div className="art-avatar-row"><i/><i/><i/></div></div>
          <div className="art-card art-two"><span>02 / COLLABORATE</span><strong>From brief to brilliant.</strong><div className="art-line"/><div className="art-line short"/></div>
          <div className="orbit orbit-a"/><div className="orbit orbit-b"/>
        </div>
      </div>
    </main>
  );
}
