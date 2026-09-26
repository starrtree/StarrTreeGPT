"use client";

import { useEffect, useRef, useState } from "react";
import { vaultTracks } from "./vaultTracks";
import { focusAudio } from "./audioFocus";

const KEY = "starrtree:vault-key:v1";
const POSITIONS = [[20,25],[70,56],[44,72],[77,22],[25,62],[52,35],[20,74],[72,68],[48,22],[28,46]];
type Phase = "locked" | "ready" | "playing" | "lost" | "earned" | "opening" | "open";

export default function UnreleasedVault() {
  const [phase, setPhase] = useState<Phase>("locked");
  const [round, setRound] = useState(0);
  const [score, setScore] = useState(0);
  const [caught, setCaught] = useState(false);
  const [relaxed, setRelaxed] = useState(false);
  const [error, setError] = useState("");
  const [muted, setMuted] = useState(false);
  const [activeId, setActiveId] = useState(vaultTracks[0].id);
  const [isPlaying, setIsPlaying] = useState(false);
  const points = useRef(0);
  const hit = useRef(false);
  const song = useRef<HTMLAudioElement>(null);
  const player = useRef<HTMLAudioElement>(null);
  const target = useRef<HTMLButtonElement>(null);
  const vaultButton = useRef<HTMLButtonElement>(null);
  const tracksHeading = useRef<HTMLHeadingElement>(null);
  const playAttempt = useRef(0);
  const active = vaultTracks.find(track => track.id === activeId)!;

  useEffect(() => {
    try { if (sessionStorage.getItem(KEY) === "earned") setPhase("earned"); } catch {}
  }, []);

  useEffect(() => {
    if (phase !== "playing") return;
    target.current?.focus({ preventScroll: true });
    if (relaxed) return;
    const timer = window.setTimeout(() => {
      if (round === POSITIONS.length - 1) finish();
      else { hit.current = false; setCaught(false); setRound(round + 1); }
    }, 2200);
    return () => window.clearTimeout(timer);
  }, [phase, round, relaxed]);

  useEffect(() => {
    if (phase !== "opening") return;
    const timer = window.setTimeout(() => setPhase("open"), 1600);
    return () => window.clearTimeout(timer);
  }, [phase]);

  useEffect(() => {
    if (phase === "earned") vaultButton.current?.focus({ preventScroll: true });
    if (phase === "open") tracksHeading.current?.focus({ preventScroll: true });
  }, [phase]);

  useEffect(() => {
    if (phase !== "playing") { song.current?.pause(); return; }
    const pauseWhenHidden = () => { if (document.hidden) { song.current?.pause(); setPhase("ready"); } };
    document.addEventListener("visibilitychange", pauseWhenHidden);
    return () => document.removeEventListener("visibilitychange", pauseWhenHidden);
  }, [phase]);

  function finish() {
    song.current?.pause();
    if (points.current >= 6) {
      try { sessionStorage.setItem(KEY, "earned"); } catch {}
      setPhase("earned");
    } else setPhase("lost");
  }

  async function start() {
    points.current = 0; hit.current = false;
    setScore(0); setRound(0); setCaught(false); setError("");
    const audio = song.current;
    if (audio) {
      audio.currentTime = 0;
      try { await audio.play(); } catch { setError("Audio couldn’t start. You can still play, or try again with sound."); }
    }
    setPhase("playing");
  }

  function catchStar() {
    if (phase !== "playing" || hit.current) return;
    hit.current = true; points.current += 1;
    setScore(points.current); setCaught(true);
    if (points.current >= 6) { finish(); return; }
    if (relaxed) { hit.current = false; setCaught(false); setRound(current => current + 1); }
  }

  async function playTrack(id: string) {
    const track = vaultTracks.find(item => item.id === id)!;
    const audio = player.current;
    if (!audio) return;
    if (id === activeId && !audio.paused) { audio.pause(); return; }
    setError("");
    const attempt = ++playAttempt.current;
    if (id !== activeId || !audio.getAttribute("src")) { setIsPlaying(false); audio.src = track.src; setActiveId(id); }
    try { await audio.play(); } catch { if (attempt === playAttempt.current) setError("This track couldn’t play. Try its play button again."); }
  }

  return <section className={`unreleased-vault vault-${phase}`} aria-label="Unreleased music vault">
    <audio ref={song} src="/audio/tracks/mypov.m4a" preload="none" muted={muted} onPlay={event => focusAudio(event.currentTarget)} onError={() => setError("Song audio is unavailable right now. The star game still works.")} />
    <div className="vault-caption"><span>MAX STARR / AFTER HOURS</span><span>{phase === "open" ? "ACCESS GRANTED" : "13 UNRELEASED TRACKS"}</span></div>
    <div className="vault-introduction"><div><p className="release-kicker">FOR THE ONES WHO GO DEEPER</p><h2>The Starr Vault</h2><p>Unreleased cuts. Late-night experiments.<br />A little further inside Max Starr’s world.</p></div><div className="vault-key-status" role="status">{["earned","opening","open"].includes(phase) ? "⚿ STARR KEY EARNED" : "⚿ KEY REQUIRED"}</div></div>
    {phase !== "open" && <div className="vault-entrance">
      <div className="vault-mechanism">
        <div className="vault-chamber" aria-hidden="true"><span>✦</span></div>
        <button ref={vaultButton} type="button" className="vault-door" disabled={phase === "opening" || phase === "playing"} aria-label={phase === "earned" ? "Use Starr Key to open vault" : "Inspect locked vault"} onClick={() => setPhase(phase === "earned" ? "opening" : "ready")}>
          <span className="vault-door-label">STARR / VAULT <small>UNRELEASED ARCHIVE</small></span>
          <span className="vault-lock" aria-hidden="true"><i /><i /><i /><b>✦</b></span>
          <span className="vault-door-status">{phase === "opening" ? "UNLOCKING…" : phase === "earned" ? "INSERT KEY · OPEN" : "LOCKED · TAP TO INSPECT"}</span>
          <span className="vault-hinge hinge-top" /><span className="vault-hinge hinge-bottom" />
        </button>
      </div>
      <div className="vault-game-panel">
        {phase === "locked" && <><h3>There’s a key in the music.</h3><p>Catch six stars while MyPOV plays. Earn your Starr Key and open the archive.</p><button className="vault-action" onClick={() => setPhase("ready")}>Find the key <span>↗</span></button></>}
        {["ready","lost"].includes(phase) && <><h3>{phase === "lost" ? "Almost had it." : "Catch a Starr"}</h3><p>{phase === "lost" ? `You caught ${score} of 6. Give it another run.` : "Tap six gold stars before they fade. You have ten chances. Keyboard: focus the star and press Space or Enter."}</p><label className="vault-relaxed"><input type="checkbox" checked={relaxed} onChange={event => setRelaxed(event.target.checked)} /> No time limit</label><button className="vault-action" onClick={start}>{phase === "lost" ? "Play again" : "Play MyPOV + start"} <span>▶</span></button></>}
        {phase === "playing" && <><div className="vault-game-status"><strong>{score} / 6 stars</strong><span>{relaxed ? "TAKE YOUR TIME" : `${round + 1} / 10 chances`}</span></div><div className="vault-game-field">
          <button ref={target} type="button" className={`vault-catch-star ${caught ? "is-caught" : ""}`} style={{ left:`${POSITIONS[round][0]}%`, top:`${POSITIONS[round][1]}%` }} aria-label={`Catch star ${round + 1}`} aria-disabled={caught} onClick={catchStar} onKeyDown={event => { if (event.repeat) event.preventDefault(); }}>✦</button>
          <span className="vault-game-feedback" aria-live="polite">{caught ? "Caught ✦" : "Catch the gold star"}</span>
        </div><div className="vault-game-tools"><button onClick={() => setMuted(!muted)} aria-pressed={muted}>{muted ? "Sound on" : "Mute"}</button><button onClick={() => { song.current?.pause(); setPhase("ready"); }}>Stop game</button></div></>}
        {phase === "earned" && <><span className="vault-earned-key" aria-hidden="true">⚿</span><h3>The key is yours.</h3><p>Thirteen unreleased tracks await. Your key stays with you for this browsing session.</p><button className="vault-action" onClick={() => setPhase("opening")}>Use Starr Key <span>⚿</span></button></>}
        {phase === "opening" && <div className="vault-opening-copy" role="status"><h3>Welcome inside.</h3><p>Opening the archive…</p></div>}
      </div>
    </div>}
    {phase === "open" && <div className="vault-library">
      <div className="vault-library-heading"><h3 ref={tracksHeading} tabIndex={-1}>Behind the door</h3><span>13 TRACKS · UNRELEASED</span></div>
      <div className="vault-listening"><span className={`vault-playing-mark ${isPlaying ? "is-playing" : ""}`} aria-hidden="true">✦</span><div><small>{isPlaying ? "NOW PLAYING" : "SELECT A TRACK"}</small><h4>{active.title}</h4><audio ref={player} controls preload="none" aria-label="Unreleased track player" onPlay={event => focusAudio(event.currentTarget)} onPlaying={() => setIsPlaying(true)} onPause={() => setIsPlaying(false)} onEnded={() => setIsPlaying(false)} onError={() => { setIsPlaying(false); setError("This track couldn’t load. Please try again."); }} /></div></div>
      <div className="vault-track-list">{vaultTracks.map((track,index) => <button key={track.id} className={track.id === activeId && isPlaying ? "active" : ""} onClick={() => playTrack(track.id)} aria-label={`${track.id === activeId && isPlaying ? "Pause" : "Play"} ${track.title}`}><span>{String(index+1).padStart(2,"0")}</span><strong>{track.title}</strong><small>{Math.floor(track.duration/60)}:{String(track.duration%60).padStart(2,"0")}</small><b aria-hidden="true">{track.id === activeId && isPlaying ? "Ⅱ" : "▶"}</b></button>)}</div>
    </div>}
    {error && <p className="vault-error" role="status">{error}</p>}
  </section>;
}
