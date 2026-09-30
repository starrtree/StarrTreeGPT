"use client";

import { useEffect, useRef } from "react";
import type { OrbitalWorld } from "./OrbitalPortfolio";
import { EPFeature, MyPOVFeature } from "./ReleasePromotion";
import MusicCatalog from "./MusicCatalog";
import CommerceCatalog from "./CommerceCatalog";
import UnreleasedVault from "./UnreleasedVault";

export default function BranchGallery({ world, onClose, onExplore, onScrollProgress }: { world: OrbitalWorld; onClose: () => void; onExplore: () => void; onScrollProgress: (progress: number) => void }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const back = useRef<HTMLButtonElement>(null);
  const projects = useRef<HTMLElement>(null);
  const vault = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    dialog.current?.showModal();
    back.current?.focus();
    return () => { dialog.current?.close(); previous?.focus(); };
  }, []);
  const music = world.id === "music";
  return <dialog ref={dialog} className="branch-gallery" style={{ "--branch-color": world.color } as React.CSSProperties} aria-labelledby="branch-heading" onCancel={(event) => { event.preventDefault(); onClose(); }}>
    <header className="branch-toolbar">
      <button ref={back} type="button" className="branch-back" onClick={onClose}>← <span>Back to System</span></button>
      <span className="branch-location">STARRTREE <i>/</i> {world.title}</span>
      <div className="branch-shortcuts">{music && <button type="button" className="branch-jump" onClick={() => vault.current?.scrollIntoView({ behavior: "instant", block: "start" })}>Vault ⚿</button>}<button type="button" className="branch-jump" onClick={() => projects.current?.scrollIntoView({ behavior: "instant", block: "start" })}>{music ? "Releases" : "Projects"} ↓</button></div>
    </header>
    <div className="branch-scroll" onScroll={(event) => {
      const area = event.currentTarget;
      onScrollProgress(area.scrollTop / Math.max(area.scrollHeight - area.clientHeight, 1));
    }}>
      <div className="branch-intro">
        <div><p className="branch-eyebrow">BRANCH {world.number} <span>✦</span></p><h1 id="branch-heading">{world.title}</h1><p className="branch-description">{world.description}</p></div>
      </div>
      {world.id === "media" && <section className="branch-art-gallery" aria-label="StarrTree visual art">
        {["origin-portrait", "tree-crown", "chakra-bloom", "cosmic-profile", "constellation-maker", "world-tree", "touch-the-orb", "awakening-bloom", "portal-flight", "tree-eye", "starborn", "blue-orb"].map((name, index) => <a key={name} href={`/images/${name}.webp`} target="_blank" rel="noopener noreferrer" aria-label={`Open artwork ${index + 1} full size`}><img src={`/images/${name}.webp`} alt={name.replaceAll("-", " ")} loading="lazy" /><span>View artwork ↗</span></a>)}
      </section>}
      {music && <section className="branch-music-feature" aria-label="Featured releases">
        <EPFeature />
        <div className="branch-video"><iframe src="https://www.youtube-nocookie.com/embed/iip5VXEFEL4?enablejsapi=1" title="MyPOV by Max Starr music video" loading="lazy" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowFullScreen /><MyPOVFeature /></div>
      </section>}
      {music && <div ref={vault}><UnreleasedVault /></div>}
      <section ref={projects} id="branch-projects" className="branch-projects" aria-label={music ? "Music catalog" : `${world.title} projects`}>
        <div className="branch-section-title"><h2>{music ? "The catalog" : "Explore the branch"}</h2><span>{music ? "MAX STARR" : `${world.projects.length} PROJECTS & OFFERINGS`}</span></div>
        {music && <MusicCatalog />}
        <div className="branch-project-grid">
          {world.projects.filter(project => !music || !["Sharks & Starrs", "MyPOV", "Audio Vault"].includes(project.name)).map((project, index) => <article className="branch-project" key={project.name}>
            <div className="branch-project-meta"><span>{String(index + 1).padStart(2, "0")}</span><span>{project.status}</span></div>
            <h3>{project.name}</h3><p>{project.detail}</p>
            {project.href ? <a href={project.href} target="_blank" rel="noopener noreferrer">{project.cta ?? `Visit ${project.name}`} <span>↗</span></a> : <button type="button" onClick={onExplore}>Explore {world.title} <span>↗</span></button>}
          </article>)}
        </div>
      </section>
      <CommerceCatalog branch={world.id} />
      <footer className="branch-footer"><span>✦ STARRTREE / {world.title}</span><button type="button" onClick={onClose}>← Back to System</button></footer>
    </div>
  </dialog>;
}
