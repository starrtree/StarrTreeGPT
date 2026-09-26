"use client";

import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";

export const MYPOV = {
  youtube: "https://youtu.be/iip5VXEFEL4",
  instagram: "https://www.instagram.com/maxstarrofficial/reel/DdXGKfgS8q3/",
  album: "https://distrokid.com/hyperfollow/maxstarr/sharks--starrs-4",
  spotify: "https://open.spotify.com/album/75D3smYthlEqONmCuYeEs5",
  apple: "https://music.apple.com/us/album/sharks-starrs/6813352691?uo=4",
};
const SESSION_KEY = "starrtree:sharks-starrs:seen";

export function EPFeature({ popup = false }: { popup?: boolean }) {
  return <div className="mypov-feature ep-feature">
    <p className="release-kicker">NEW EP ✦</p>
    <img className="release-artwork" src="/images/releases/sharks-starrs.jpg" alt="Sharks & Starrs EP cover" width={450} height={450} />
    <h2 id={popup ? "release-title" : undefined}>Sharks &amp; Starrs</h2>
    <p className="release-artist">MAX STARR</p>
    <p className="ep-track-context">7 tracks. MyPOV + 6 more.<br /><span>EP • 09.18.26</span></p>
    <div className="release-actions">
      <a className="release-youtube release-primary" href={MYPOV.album} target="_blank" rel="noopener noreferrer">STREAM THE EP ↗</a>
      <a className="release-instagram" href={MYPOV.youtube} target="_blank" rel="noopener noreferrer">▶ WATCH MyPOV ON YOUTUBE</a>
      <a className="release-tertiary" href={MYPOV.instagram} target="_blank" rel="noopener noreferrer">MyPOV on Instagram ↗</a>
    </div>
    {!popup && <nav className="release-streams" aria-label="Stream Sharks and Starrs">
      <a href={MYPOV.spotify} target="_blank" rel="noopener noreferrer">Spotify ↗</a>
      <a href={MYPOV.apple} target="_blank" rel="noopener noreferrer">Apple Music ↗</a>
    </nav>}
  </div>;
}

export function MyPOVFeature({ popup = false }: { popup?: boolean }) {
  return (
    <div className="mypov-feature">
      <p className="release-kicker">{popup ? "NEW RELEASE ✦" : "NEW MUSIC VIDEO"}</p>
      <h2 id={popup ? "release-title" : undefined}>MyPOV</h2>
      <img className="release-artwork mypov-artwork" src="/images/releases/mypov.jpg" alt="MyPOV cover art" width={450} height={450} />
      {popup && <p className="release-announcement">THE NEW MUSIC VIDEO<br />IS OUT NOW</p>}
      <p className="release-artist">MAX STARR</p>
      <div className="release-actions">
        <a className="release-youtube" href={MYPOV.youtube} target="_blank" rel="noopener noreferrer" autoFocus={popup}>▶ WATCH ON YOUTUBE</a>
        <a className="release-instagram" href={MYPOV.instagram} target="_blank" rel="noopener noreferrer">WATCH ON INSTAGRAM</a>
      </div>
      <p className="release-context">First release from <strong>SHARKS &amp; STARRS</strong><span>EP • 09.18.26</span></p>
      {!popup && <nav className="release-streams" aria-label="Listen to Sharks and Starrs">
        <a href={MYPOV.spotify} target="_blank" rel="noopener noreferrer">Spotify ↗</a>
        <a href={MYPOV.apple} target="_blank" rel="noopener noreferrer">Apple Music ↗</a>
        <a href={MYPOV.album} target="_blank" rel="noopener noreferrer">All platforms ↗</a>
      </nav>}
    </div>
  );
}

export function ReleasePopup({ ready }: { ready: boolean }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const shown = useRef(false);
  const previousFocus = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!ready || shown.current) return;
    try { if (sessionStorage.getItem(SESSION_KEY)) return; } catch { /* Storage may be disabled. */ }
    const timer = window.setTimeout(() => {
      const element = dialog.current;
      if (!element || element.open) return;
      previousFocus.current = document.activeElement as HTMLElement | null;
      element.showModal();
      element.querySelector<HTMLAnchorElement>(".release-primary")?.focus();
      shown.current = true;
      try { sessionStorage.setItem(SESSION_KEY, "1"); } catch { /* The ref still prevents repeats on this visit. */ }
    }, 350);
    return () => window.clearTimeout(timer);
  }, [ready]);

  if (!ready || typeof document === "undefined") return null;
  return createPortal(
    <dialog ref={dialog} className="release-dialog" aria-labelledby="release-title"
      onClose={() => {
        const target = previousFocus.current?.isConnected ? previousFocus.current : null;
        if (target && target !== document.body && !target.closest('[aria-hidden="true"]')) target.focus();
        else document.querySelector<HTMLAnchorElement>(".site-header a[href]")?.focus();
      }}
      onClick={(event) => {
        if (event.target !== event.currentTarget) return;
        const bounds = event.currentTarget.getBoundingClientRect();
        if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) event.currentTarget.close();
      }}>
      <button className="release-close" type="button" aria-label="Close new release" onClick={() => dialog.current?.close()}>×</button>
      <EPFeature popup />
    </dialog>, document.body,
  );
}
