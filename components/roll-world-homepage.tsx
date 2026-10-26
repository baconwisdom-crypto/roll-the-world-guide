import Link from "next/link";
import homepage from "@/config/homepage.json";
import { siteConfig } from "@/config/site";
import { ContentImage } from "./content-image";

type Action = { label: string; href: string };
function ActionLink({ action, primary = false }: { action: Action; primary?: boolean }) {
  return <Link className={primary ? "rw-button rw-button-primary" : "rw-button rw-button-secondary"} href={action.href} {...(action.href.startsWith("https:") ? { target: "_blank", rel: "noopener noreferrer" } : {})}>{action.label}</Link>;
}

export function RollWorldHomepage() {
  const { hero, start, aboutGame, finalCta } = homepage.home;
  const image = siteConfig.heroImage;
  return <div className="rw-home" data-homepage-content="reviewed">
    <header className="rw-hero">
      <div className="rw-hero-copy">
        <p className="arch-kicker">{hero.eyebrow}</p>
        <h1>{hero.title}</h1>
        <p className="rw-hero-description">{hero.description}</p>
        <div className="rw-actions"><ActionLink action={hero.primaryCta} primary /><ActionLink action={hero.secondaryCta} /></div>
        <div className="rw-community-video"><ActionLink action={hero.tertiaryCta} /><p>{hero.videoLabel}</p></div>
      </div>
      {image && <div className="arch-brand-image"><ContentImage bare preload image={{ src: image.src, alt: image.alt.en, ratio: image.ratio, fit: image.fit }} /></div>}
    </header>
    <ul className="rw-hero-stats" aria-label="Game essentials">{hero.stats.map(stat => <li key={stat}>{stat}</li>)}</ul>
    <section className="rw-start" aria-labelledby="home-start-title">
      <p className="arch-kicker">{start.eyebrow}</p><h2 id="home-start-title">{start.title}</h2>
      <nav className="rw-start-grid" aria-label="First two hours guides">{start.cards.map(card => <Link key={card.number} href={card.href} className="rw-start-card" data-start-card={card.number}><span className="rw-card-number">{card.number}</span><h3>{card.title}</h3><p>{card.description}</p><span className="rw-card-link">Read guide <span aria-hidden="true">→</span></span></Link>)}</nav>
    </section>
    <section className="rw-about" aria-labelledby="home-about-title"><h2 id="home-about-title">{aboutGame.title}</h2><div className="rw-about-grid"><div>{aboutGame.paragraphs.map(paragraph => <p key={paragraph}>{paragraph}</p>)}<ActionLink action={aboutGame.cta} /></div><aside aria-label="Progression essentials"><dl className="rw-about-stats">{aboutGame.stats.map(stat => <div key={stat.label}><dt>{stat.label}</dt><dd>{stat.value}</dd></div>)}</dl><SidebarCodes /></aside></div></section>
    <section className="rw-final" aria-labelledby="home-final-title"><h2 id="home-final-title">{finalCta.title}</h2><p>{finalCta.description}</p><div className="rw-actions"><ActionLink action={finalCta.primary} primary /><ActionLink action={finalCta.secondary} /></div></section>
  </div>;
}

export function SidebarCodes() {
  return <section className="rw-sidebar-codes" aria-label="Developer-listed code"><h2>Code to try</h2>{homepage.sidebarCodes.map(entry => <div key={entry.code}><Link href={entry.href}><code>{entry.code}</code></Link><p>{entry.rewards}</p><p className="rw-code-status">{entry.status}</p></div>)}</section>;
}
