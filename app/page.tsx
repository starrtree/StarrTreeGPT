"use client";

import { useCallback, useEffect, useRef, useState, type CSSProperties } from "react";
import dynamic from "next/dynamic";
import { useForm, ValidationError } from "@formspree/react";
import StarrFX from "./StarrFX";
import MusicCatalog from "./MusicCatalog";
import CommerceCatalog from "./CommerceCatalog";
import UnreleasedVault from "./UnreleasedVault";
import { EPFeature, MYPOV } from "./ReleasePromotion";

const OrbitalPortfolio = dynamic(() => import("./OrbitalPortfolio"), {
  ssr: false,
  loading: () => (
    <div className="orbital-code-loading" aria-label="Loading the StarrTree introduction">
      <span aria-hidden="true">✦</span>
      <i aria-hidden="true" />
    </div>
  ),
});

const treeRootPaths = [
  // T: tap root, lateral roots, then fine roots from the letter outline.
  { d: "M52 143 C52 157 47 169 38 179 C28 190 27 203 14 222", tone: "primary", delay: 0 },
  { d: "M41 176 C27 174 19 166 8 166", tone: "secondary", delay: 330 },
  { d: "M31 190 C43 192 50 201 55 214", tone: "tertiary", delay: 455 },
  { d: "M18 58 C9 49 7 35 12 22 C15 14 13 9 10 5", tone: "secondary", delay: 105 },
  { d: "M87 58 C96 49 101 36 99 23 C98 15 102 9 108 5", tone: "secondary", delay: 165 },
  { d: "M52 95 C39 91 31 81 28 69", tone: "tertiary", delay: 245 },
  { d: "M52 112 C66 108 73 99 76 87", tone: "tertiary", delay: 285 },

  // R.
  { d: "M145 143 C144 158 138 169 130 181 C120 194 117 207 108 223", tone: "primary", delay: 45 },
  { d: "M132 179 C147 181 157 191 163 205", tone: "secondary", delay: 370 },
  { d: "M122 196 C111 194 101 199 93 210", tone: "tertiary", delay: 500 },
  { d: "M145 52 C138 41 126 33 123 20 C120 12 123 7 129 4", tone: "secondary", delay: 145 },
  { d: "M190 76 C202 67 208 54 207 41 C206 31 211 25 219 23", tone: "secondary", delay: 220 },
  { d: "M145 82 C132 80 123 73 117 63", tone: "tertiary", delay: 300 },
  { d: "M188 139 C201 148 205 162 221 168 C231 172 236 180 240 190", tone: "secondary", delay: 420 },

  // First E.
  { d: "M249 143 C244 157 246 171 237 183 C226 197 228 211 221 224", tone: "primary", delay: 90 },
  { d: "M239 181 C224 179 215 171 204 171", tone: "secondary", delay: 410 },
  { d: "M232 197 C244 200 254 209 258 221", tone: "tertiary", delay: 545 },
  { d: "M233 52 C222 43 216 32 218 20 C220 13 218 8 214 4", tone: "secondary", delay: 185 },
  { d: "M291 52 C302 43 306 30 302 17 C299 11 301 6 307 3", tone: "secondary", delay: 260 },
  { d: "M282 93 C294 98 301 108 303 122", tone: "tertiary", delay: 340 },
  { d: "M291 139 C301 151 305 165 319 171", tone: "secondary", delay: 465 },
  { d: "M233 97 C221 96 212 103 206 113", tone: "tertiary", delay: 385 },

  // Second E.
  { d: "M352 143 C355 158 348 169 357 183 C369 198 367 211 375 224", tone: "primary", delay: 135 },
  { d: "M358 182 C344 181 336 174 326 174", tone: "secondary", delay: 450 },
  { d: "M366 198 C379 201 388 209 393 221", tone: "tertiary", delay: 590 },
  { d: "M336 52 C326 42 320 31 322 19 C324 12 322 7 318 3", tone: "secondary", delay: 225 },
  { d: "M394 52 C405 42 410 30 406 17 C404 10 407 5 414 2", tone: "secondary", delay: 300 },
  { d: "M385 93 C398 97 405 107 410 119", tone: "tertiary", delay: 380 },
  { d: "M394 139 C405 150 411 163 424 168", tone: "secondary", delay: 510 },
  { d: "M336 97 C324 96 315 103 309 114", tone: "tertiary", delay: 425 },
] as const;

function TreeRootGrowth() {
  return (
    <span className="tree-hover-growth" aria-hidden="true">
      <svg viewBox="0 0 430 230" preserveAspectRatio="none">
        <defs>
          <linearGradient id="root-bark" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#e5bd79" />
            <stop offset=".38" stopColor="#9c643b" />
            <stop offset="1" stopColor="#543522" />
          </linearGradient>
        </defs>
        {treeRootPaths.map((root, index) => (
          <g key={`${root.tone}-${index}`}>
          <path className={`tree-root-path tree-root-bark tree-root-${root.tone}`} d={root.d} pathLength={1} style={{ "--root-delay": `${root.delay}ms` } as CSSProperties} />
          <path
            className={`tree-root-path tree-root-${root.tone}`}
            d={root.d}
            pathLength={1}
            style={{ "--root-delay": `${root.delay}ms` } as CSSProperties}
          />
          </g>
        ))}
        {[52, 145, 249, 352].flatMap((origin, index) => Array.from({ length: 9 }, (_, twig) => {
          const side = twig % 2 === 0 ? -1 : 1;
          const y = 158 + twig * 6;
          const x = Math.round((origin + Math.sin(twig * 1.7 + index) * 8) * 100) / 100;
          const reach = 12 + (twig * 7 + index * 3) % 24;
          return <path key={`feeder-${index}-${twig}`} className="tree-root-path tree-root-feeder" pathLength={1}
            d={`M${x} ${y} C${x + side * 8} ${y + 3} ${x + side * reach} ${y + 6} ${x + side * reach} ${y + 17} m0 -7 q${side * 6} 1 ${side * 9} 8`}
            style={{ "--root-delay": `${480 + twig * 65 + index * 45}ms` } as CSSProperties} />;
        }))}
      </svg>
    </span>
  );
}

type World = {
  id: string;
  number: string;
  symbol: string;
  title: string;
  short: string;
  description: string;
  image: string;
  color: string;
  projects: WorldProject[];
};

type WorldProject = {
  name: string;
  detail: string;
  status: string;
  href?: string;
  cta?: string;
};

const worlds: World[] = [
  {
    id: "systems",
    number: "01",
    symbol: "✦",
    title: "Tech + AI",
    short: "Intelligent tools that turn ideas into momentum.",
    description:
      "AI products, creative technology, project systems and automations designed around the way real people think, build and get work done.",
    image: "/images/atlas-orb.webp",
    color: "#ffbd56",
    projects: [
      { name: "OZI", detail: "Generative edutainment engine", status: "BUILDING" },
      { name: "StarrLign", detail: "AI-native project command system", status: "LIVE" },
      { name: "StarrBoard", detail: "Spatial planning and focus interface", status: "LIVE" },
      { name: "Agentic Automation", detail: "Custom workflows for modern teams", status: "SERVICE" },
    ],
  },
  {
    id: "music",
    number: "02",
    symbol: "♬",
    title: "Music",
    short: "Sound, artist development and the Max Starr catalog.",
    description:
      "Stream Max Starr releases, hear selected audio, and explore practical services for new vocal artists building their sound and confidence.",
    image: "/images/polarity.webp",
    color: "#b66cff",
    projects: [
      { name: "Sharks & Starrs", detail: "NEW EP · MyPOV + 6 more tracks · 09.18.26", status: "NEW EP", href: MYPOV.album, cta: "STREAM THE EP" },
      { name: "MyPOV", detail: "NEW MUSIC VIDEO · First release from SHARKS & STARRS · EP 09.18.26", status: "FEATURED", href: MYPOV.youtube, cta: "WATCH ON YOUTUBE" },
      { name: "Max Starr", detail: "Videos, releases and the artist world", status: "WATCH", href: "https://www.youtube.com/channel/UCfMf248pQjZKrdbbYUoVLIA", cta: "OPEN YOUTUBE" },
      { name: "Audio Vault", detail: "Selected songs, snippets and works in progress", status: "LISTEN" },
      { name: "SoundCloud Archive", detail: "Independent releases and experiments", status: "STREAM", href: "https://soundcloud.com/max-starr-31684511", cta: "OPEN SOUNDCLOUD" },
      { name: "BandLab Transmission", detail: "Hear the latest shared BandLab track", status: "LISTEN", href: "https://www.bandlab.com/track/0daaa3d3-ff80-f011-b480-000d3aa44c65?revId=09aaa3d3-ff80-f011-b480-000d3aa44c65", cta: "OPEN BANDLAB" },
      { name: "Vocal Presets", detail: "Ready-to-record vocal chains and setup help", status: "STORE SOON" },
    ],
  },
  {
    id: "media",
    number: "03",
    symbol: "◉",
    title: "Media Art",
    short: "Edited images, moving worlds and experimental media.",
    description:
      "A living image and video library spanning generative art, editing, cinematic experiments, character design and creative direction.",
    image: "/images/constellation-maker.webp",
    color: "#ff7fe5",
    projects: [
      { name: "Edited Art Library", detail: "Curated visual edits and image experiments", status: "GALLERY" },
      { name: "Instagram Visual Feed", detail: "Art, music, process and life in motion", status: "FOLLOW", href: "https://www.instagram.com/maxstarrofficial/", cta: "OPEN INSTAGRAM" },
      { name: "TikTok Experiments", detail: "Short-form worlds, ideas and behind-the-scenes", status: "WATCH", href: "https://www.tiktok.com/@imaxstarrofficial", cta: "OPEN TIKTOK" },
      { name: "Film + Music Video", detail: "Cinematic concepts, edits and treatments", status: "MEDIA" },
      { name: "StarrX Universe", detail: "Characters, mythology and visual storytelling", status: "DEVELOPING" },
    ],
  },
  {
    id: "education",
    number: "04",
    symbol: "✺",
    title: "Education + Youth",
    short: "Future-ready learning through creative play.",
    description:
      "Creative AI education that helps young people transform their ideas into films, images, stories and real technology projects.",
    image: "/images/touch-the-orb.webp",
    color: "#58c7ff",
    projects: [
      { name: "Shoot With A Camera", detail: "AI, filmmaking and youth storytelling", status: "PROGRAM" },
      { name: "SWAC Student Films", detail: "Videos created by youth program participants", status: "SHOWCASE" },
      { name: "Creative AI Club", detail: "Bethany School creative technology lab", status: "TEACHING" },
      { name: "Bethany Student Videos", detail: "Featured films made by Creative AI Club students", status: "SHOWCASE" },
      { name: "Youth Workshops", detail: "Hands-on creative AI sessions for ages 10–18", status: "BOOKABLE" },
    ],
  },
  {
    id: "collaborations",
    number: "05",
    symbol: "∞",
    title: "Creative Collaborations",
    short: "The strongest branches grow together.",
    description:
      "Selected partnerships, collectives and rare creative-technology experiences built with artists, founders, researchers and community organizations.",
    image: "/images/world-orb.webp",
    color: "#8fffc7",
    projects: [
      { name: "Timeless No Limit", detail: "Entertainment and education for limitless living", status: "VISIT", href: "https://timelessnolimit.com", cta: "ENTER TIMELESS" },
      { name: "Timeless Social", detail: "The collective's newest content and collaborations", status: "FOLLOW", href: "https://www.instagram.com/timeless_nolimit/", cta: "OPEN INSTAGRAM" },
      { name: "BeBrownBrave", detail: "Community-centered creative collaboration", status: "PARTNER" },
      { name: "PGS Fellowship", detail: "Aerospace fellowship, mentorship and a bigger belief in the impossible", status: "PROFILE", href: "https://www.pgsfellowship.org/maxwell-ty-starr", cta: "READ PROFILE" },
      { name: "MIT Biomechatronics", detail: "Magnetomicrometry, advanced prosthetics and Hugh Herr's lab", status: "RESEARCH" },
    ],
  },
  {
    id: "wisdom",
    number: "06",
    symbol: "◈",
    title: "3rd Eye",
    short: "Wisdom, philosophy and lessons from the path.",
    description:
      "Reflections on creativity, technology, nature, discipline and the inner principles that shape the work across every StarrTree branch.",
    image: "/images/tree-eye.webp",
    color: "#a787ff",
    projects: [
      { name: "Wisdom Pieces", detail: "Short essays and lived observations", status: "READ" },
      { name: "Creative Philosophy", detail: "Principles for imagination and execution", status: "LESSONS" },
      { name: "Ancient + Emerging", detail: "Where ancestral knowledge meets new technology", status: "THOUGHT" },
      { name: "Path Notes", detail: "Mindset, discipline and lessons in motion", status: "JOURNAL" },
    ],
  },
  {
    id: "design",
    number: "07",
    symbol: "△",
    title: "Design",
    short: "Web experiences for businesses with something real to say.",
    description:
      "Web development and digital direction for businesses that need a polished, memorable presence built around their story, services and audience.",
    image: "/images/world-tree.webp",
    color: "#66e6ff",
    projects: [
      { name: "Business Websites", detail: "Strategic design and development from concept to launch", status: "SERVICE" },
      { name: "Interactive 3D", detail: "Immersive WebGL and motion-led experiences", status: "SERVICE" },
      { name: "Brand Systems", detail: "Identity, messaging and a cohesive digital language", status: "SERVICE" },
      { name: "AI Web Experiences", detail: "Smart tools and generative interactions for the web", status: "BUILD" },
    ],
  },
];

const storyFrames = [
  { image: "/images/ascent.webp", label: "ROOT", title: "Every world begins with a real need." },
  { image: "/images/gateway-flight.webp", label: "REACH", title: "Research becomes direction." },
  { image: "/images/warp-flight.webp", label: "BUILD", title: "Ideas become working systems." },
  { image: "/images/node-chamber.webp", label: "BRANCH", title: "One creation unlocks the next." },
  { image: "/images/cosmic-tree.webp", label: "GROW", title: "The work becomes an ecosystem." },
];

const gallery = [
  "/images/origin-portrait.webp",
  "/images/tree-crown.webp",
  "/images/chakra-bloom.webp",
  "/images/cosmic-profile.webp",
  "/images/constellation-maker.webp",
  "/images/world-tree.webp",
  "/images/touch-the-orb.webp",
  "/images/awakening-bloom.webp",
  "/images/portal-flight.webp",
  "/images/tree-eye.webp",
  "/images/starborn.webp",
  "/images/blue-orb.webp",
];

const featuredTreasures = [
  {
    id: "engineering",
    label: "ENGINEERING / ORIGIN STORY",
    title: "From aerospace fellowship to MIT bionics.",
    copy: "The Patti Grace Smith Fellowship expanded my aerospace community and helped turn an impossible-looking path into something tangible. At MIT Media Lab, I worked with the Biomechatronics team around magnetomicrometry and advanced prostheses—where magnetism, human movement and invention met.",
    image: "https://images.squarespace-cdn.com/content/v1/5f61676ab765cc4f9c9ecc02/d601ac40-cf78-4cb9-bb8b-9b35ba6233d1/IMG_5637.jpeg",
    imageAlt: "Maxwell Ty Starr, Patti Grace Smith Fellow",
    color: "#69c9ff",
    tags: ["PGSF CLASS OF 2022", "MIT MEDIA LAB", "BIOMECHATRONICS"],
    links: [
      { label: "Read the official PGS profile", href: "https://www.pgsfellowship.org/maxwell-ty-starr" },
    ],
  },
  {
    id: "music",
    label: "MUSIC / MOST WATCHED",
    title: "A 2020 quarantine spark that kept traveling.",
    copy: "This kid-friendly COVID-19 quarantine release is still my most popular video. It is only one early branch of a catalog that now reaches into hip-hop, R&B, dancehall and Afrobeats—but it proves a simple idea can keep finding people years later.",
    image: "https://img.youtube.com/vi/yekTtcCcrkU/hqdefault.jpg",
    imageAlt: "Thumbnail for Max Starr's 2020 quarantine song",
    color: "#d277ff",
    tags: ["2020 RELEASE", "YOUTH MUSIC", "MAX STARR"],
    links: [
      { label: "Watch the video", href: "https://www.youtube.com/watch?v=yekTtcCcrkU" },
      { label: "Open artist channel", href: "https://www.youtube.com/channel/UCfMf248pQjZKrdbbYUoVLIA" },
    ],
  },
  {
    id: "timeless",
    label: "COLLECTIVE / PARTNERSHIP",
    title: "Timeless No Limit.",
    copy: "A content creation collective producing entertainment and education around physical, spiritual and social health. The mission is limitlessness: surpassing boundaries, refusing boxes and transmuting the hard parts of life into something useful.",
    image: null,
    imageAlt: "",
    color: "#ff9f4a",
    tags: ["ENTERTAINMENT", "EDUCATION", "TRANSMUTATION"],
    links: [
      { label: "Visit Timeless No Limit", href: "https://timelessnolimit.com" },
      { label: "Follow the collective", href: "https://www.instagram.com/timeless_nolimit/" },
    ],
  },
  {
    id: "build",
    label: "SERVICES / BUILD WITH ME",
    title: "Websites that feel like worlds, not templates.",
    copy: "I combine story, interface design, AI, motion and practical engineering to build memorable websites and digital systems. The goal is not decoration—it is a living experience that makes the value of your work easier to feel and act on.",
    image: "/images/world-tree.webp",
    imageAlt: "A luminous digital world tree",
    color: "#70f0bd",
    tags: ["WEB DEVELOPMENT", "AI SYSTEMS", "INTERACTIVE 3D"],
    links: [],
  },
] as const;

const socialSignals = [
  { platform: "Instagram", handle: "@maxstarrofficial", href: "https://www.instagram.com/maxstarrofficial/", symbol: "◎" },
  { platform: "TikTok", handle: "@imaxstarrofficial", href: "https://www.tiktok.com/@imaxstarrofficial", symbol: "♪" },
  { platform: "YouTube", handle: "Max Starr", href: "https://www.youtube.com/channel/UCfMf248pQjZKrdbbYUoVLIA", symbol: "▶" },
  { platform: "SoundCloud", handle: "Max Starr", href: "https://soundcloud.com/max-starr-31684511", symbol: "≈" },
  { platform: "BandLab", handle: "Latest transmission", href: "https://www.bandlab.com/track/0daaa3d3-ff80-f011-b480-000d3aa44c65?revId=09aaa3d3-ff80-f011-b480-000d3aa44c65", symbol: "◉" },
] as const;

const offers = [
  { number: "01", title: "Website Development", copy: "Strategic websites, immersive portfolios and interactive 3D experiences built from story to launch.", project: "Interactive Website", status: "BOOKING" },
  { number: "02", title: "AI + Automation", copy: "Agents, internal tools and workflows that turn repetitive work into useful systems.", project: "AI + Automation", status: "BOOKING" },
  { number: "03", title: "Artist Features", copy: "Book Max Starr for a verse, hook or creative collaboration across hip-hop, R&B, dancehall and Afrobeats.", project: "Artist Feature", status: "PAID" },
  { number: "04", title: "Vocal Presets", copy: "Ready-to-record vocal chains plus setup guidance. Individual preset covers and secure checkout are coming next.", project: "Vocal Preset / Recording Setup", status: "STORE SOON" },
  { number: "05", title: "Education + Workshops", copy: "Creative AI learning experiences for schools, youth programs, teams and future-facing educators.", project: "Education + Workshop", status: "BOOKING" },
  { number: "06", title: "Creative Direction", copy: "Visual worlds, content systems, music-video concepts and generative campaigns with a clear point of view.", project: "Creative Direction", status: "BOOKING" },
] as const;

function scrollToId(id: string) {
  window.dispatchEvent(new CustomEvent("starrtree:navigate", { detail: { id } }));
  document.body.style.overflow = "";
  document.documentElement.style.overflow = "";
  document.body.classList.remove("planet-open");
  window.requestAnimationFrame(() => {
    window.requestAnimationFrame(() => {
      document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  });
}

export default function Home() {
  const [introComplete, setIntroComplete] = useState(false);
  const [activeWorld, setActiveWorld] = useState(worlds[0]);
  const [openWorld, setOpenWorld] = useState<World | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [briefOpen, setBriefOpen] = useState(false);
  const [briefProject, setBriefProject] = useState("");
  const [musicOpen, setMusicOpen] = useState(false);
  const [titleHover, setTitleHover] = useState<"starr" | "tree" | null>(null);
  const [copied, setCopied] = useState(false);
  const [progress, setProgress] = useState(0);
  const starrTitleRef = useRef<HTMLDivElement>(null);
  const treeTitleRef = useRef<HTMLDivElement>(null);
  const [formState, handleFormSubmit, resetForm] = useForm("mrenoeqd");
  const handleIntroComplete = useCallback(() => setIntroComplete(true), []);

  useEffect(() => {
    const update = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      setProgress(max > 0 ? (window.scrollY / max) * 100 : 0);
    };
    update();
    window.addEventListener("scroll", update, { passive: true });
    return () => window.removeEventListener("scroll", update);
  }, []);

  useEffect(() => {
    document.body.style.overflow = openWorld || briefOpen || menuOpen || musicOpen ? "hidden" : "";
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpenWorld(null);
        setBriefOpen(false);
        setBriefProject("");
        setMusicOpen(false);
        setMenuOpen(false);
        resetForm();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [openWorld, briefOpen, menuOpen, musicOpen, resetForm]);

  useEffect(() => {
    if (!introComplete) return;

    const containsPoint = (element: HTMLElement | null, x: number, y: number) => {
      if (!element) return false;
      const bounds = element.getBoundingClientRect();
      return x >= bounds.left && x <= bounds.right && y >= bounds.top && y <= bounds.bottom;
    };

    const onPointerMove = (event: PointerEvent) => {
      const nextHover = containsPoint(starrTitleRef.current, event.clientX, event.clientY)
        ? "starr"
        : containsPoint(treeTitleRef.current, event.clientX, event.clientY)
          ? "tree"
          : null;
      setTitleHover((current) => current === nextHover ? current : nextHover);
    };
    const clearHover = () => setTitleHover(null);

    window.addEventListener("pointermove", onPointerMove, { passive: true });
    window.addEventListener("blur", clearHover);
    return () => {
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("blur", clearHover);
    };
  }, [introComplete]);

  function closeBrief() {
    setBriefOpen(false);
    setBriefProject("");
    resetForm();
  }

  function openBrief(project = "") {
    setBriefProject(project);
    setBriefOpen(true);
  }

  async function copyBrief() {
    const text = "I want to build something with StarrTree. My project is…";
    await navigator.clipboard.writeText(text);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  }

  return (
    <main className={`${introComplete ? "intro-complete" : "intro-pending"}${titleHover ? ` title-hover-${titleHover}` : ""}`}>
      <StarrFX />
      <div className="progress-line" style={{ transform: `scaleX(${progress / 100})` }} />

      <header className="site-header">
        <button className="brand" onClick={() => scrollToId("top")} aria-label="Back to top">
          <span className="brand-mark" aria-hidden="true">
            <img src="/images/starrtree-gold-logo.png" alt="" />
            <i />
          </span>
          <span className="brand-name">StarrTree</span>
        </button>
        <nav className="desktop-nav" aria-label="Primary navigation">
          <button onClick={() => scrollToId("worlds")}>Worlds</button>
          <button onClick={() => scrollToId("work")}>Work</button>
          <button onClick={() => scrollToId("about")}>About</button>
          <button onClick={() => openBrief()} className="nav-cta">Start a project <span>↗</span></button>
        </nav>
        <button className="menu-trigger" aria-label="Open menu" aria-expanded={menuOpen} onClick={() => setMenuOpen(true)}>
          <span />
          <span />
        </button>
      </header>

      <section className="hero" id="top" aria-label="StarrTree introduction">
        <div className="hero-image" />
        <div className="hero-vignette" />
        <div className="hero-energy" aria-hidden="true"><i /><i /><i /><i /><i /><i /></div>
        <div className="starfield starfield-a" />
        <div className="starfield starfield-b" />

        <div className="hero-copy">
          <p className="hero-signature marvel-signature">M<b>✦</b>x St<b>✦</b>rr&apos;s</p>
          <div className="hero-title-split" aria-label="StarrTree">
            <div ref={starrTitleRef} className="hero-title-half hero-title-starr">
              <h1 aria-hidden="true">STARR</h1>
              <p>A Light that Grows through its Darkness...</p>
              <span className="starr-hover-stars" aria-hidden="true">
                <i /><i /><i /><i /><i /><i /><i />
              </span>
            </div>
            <div ref={treeTitleRef} className="hero-title-half hero-title-tree">
              <div className="tree-word-shell">
                <h1 aria-hidden="true">TREE</h1>
                <TreeRootGrowth />
              </div>
              <p>A Life that Shines through its Branches...</p>
            </div>
          </div>
          <p className="hero-description sr-only">
            StarrTree is the creative ecosystem of Max Starr—connecting technology, music, media, education, wisdom and design into work that moves people forward.
          </p>
        </div>

        <OrbitalPortfolio
          worlds={worlds}
          onIntroComplete={handleIntroComplete}
          onNavigateToWorld={(id) => {
            const world = worlds.find((item) => item.id === id);
            if (world) setActiveWorld(world);
            scrollToId("worlds");
          }}
          onOpenMusicVault={() => setMusicOpen(true)}
        />

        <div className="scroll-cue"><span>SCROLL DOWN</span><i /></div>
      </section>

      <section className="manifesto" id="about">
        <div className="section-index">THE ROOT SYSTEM <span>00</span></div>
        <div className="manifesto-grid">
          <h2>Not a portfolio.<br /><em>An ecosystem.</em></h2>
          <div className="manifesto-copy">
            <p className="lead">StarrTree is what happens when the branches stop competing and start feeding the same root.</p>
            <p>Music shapes the storytelling. Engineering makes it real. Education makes it useful. AI helps it scale. Every project is its own world, but each world strengthens the whole.</p>
            <div className="signature"><span>Max Starr</span><small>CREATIVE ENGINEER · EDUCATOR · ARTIST</small></div>
          </div>
        </div>
        <div className="manifesto-image">
          <img src="/images/origin-portrait.webp" alt="Max Starr beside a luminous cosmic node" loading="lazy" />
          <span className="image-note image-note-one">THE HUMAN AT THE CENTER</span>
          <span className="image-note image-note-two">CINCINNATI → EVERYWHERE</span>
        </div>
      </section>

      <section className="worlds-section" id="worlds">
        <div className="section-heading">
          <div className="section-index">THE CONSTELLATION <span>01—07</span></div>
          <h2>Choose a world.<br /><em>Follow the light.</em></h2>
          <p>Each node is a different branch of the same creative system. Select one to see what is growing there.</p>
        </div>

        <div className="world-selector" role="tablist" aria-label="StarrTree project worlds">
          {worlds.map((world) => (
            <button
              key={world.id}
              role="tab"
              aria-selected={activeWorld.id === world.id}
              className={activeWorld.id === world.id ? "active" : ""}
              style={{ "--orb-color": world.color } as React.CSSProperties}
              onClick={() => setActiveWorld(world)}
            >
              <span className="selector-number">{world.number}</span>
              <span className="selector-orb"><i>{world.symbol}</i></span>
              <span className="selector-name">{world.title}</span>
            </button>
          ))}
        </div>

        <div className="world-detail" key={activeWorld.id} style={{ "--orb-color": activeWorld.color } as React.CSSProperties}>
          <div className="world-detail-image">
            <img src={activeWorld.image} alt="" />
            <span className="world-number">{activeWorld.number}</span>
            <div className="world-glow" />
          </div>
          <div className="world-detail-copy">
            <p className="world-kicker">ACTIVE NODE / {activeWorld.number}</p>
            <h3>{activeWorld.title}</h3>
            <p className="world-short">{activeWorld.short}</p>
            <p className="world-description">{activeWorld.description}</p>
            {activeWorld.id === "music" && <EPFeature />}
            <div className="project-list">
              {activeWorld.projects.filter((project) => !["MyPOV", "Sharks & Starrs"].includes(project.name)).map((project) => {
                const content = <><span><b>{project.name}</b><small>{project.detail}</small></span><i>{project.status}</i><em>↗</em></>;
                return project.href ? (
                  <a key={project.name} href={project.href} target="_blank" rel="noreferrer">{content}</a>
                ) : (
                  <button
                    key={project.name}
                    onClick={() => {
                      if (activeWorld.id === "music" && project.name === "Audio Vault") {
                        setMusicOpen(true);
                        return;
                      }
                      setOpenWorld(activeWorld);
                    }}
                  >
                    {content}
                  </button>
                );
              })}
            </div>
            <button className="primary-button compact" onClick={() => setOpenWorld(activeWorld)}>Open this world <span>↗</span></button>
          </div>
        </div>
      </section>

      <section className="treasure-section" id="work">
        <div className="treasure-heading">
          <div className="section-index">THE TREASURE MAP <span>START HERE</span></div>
          <h2>Every click should<br />reveal <em>more value.</em></h2>
          <p>This is the first layer of the real StarrTree: proof, stories, work and opportunities connected into one path. Follow whatever light catches you first.</p>
        </div>

        <div className="treasure-grid">
          {featuredTreasures.map((treasure) => (
            <article className={`treasure-card treasure-${treasure.id}`} key={treasure.id} style={{ "--treasure-color": treasure.color } as CSSProperties}>
              <div className="treasure-visual">
                {treasure.image ? (
                  <img src={treasure.image} alt={treasure.imageAlt} loading="lazy" />
                ) : (
                  <div className="treasure-placeholder" aria-label="Timeless No Limit imagery coming soon">
                    <span>∞</span><b>TIMELESS<br />NO LIMIT</b><small>COLLECTIVE VISUALS COMING SOON</small>
                  </div>
                )}
                <i className="treasure-beacon" aria-hidden="true" />
              </div>
              <div className="treasure-copy">
                <p>{treasure.label}</p>
                <h3>{treasure.title}</h3>
                <span>{treasure.copy}</span>
                <div className="treasure-tags">
                  {treasure.tags.map((tag) => <small key={tag}>{tag}</small>)}
                </div>
                <div className="treasure-links">
                  {treasure.id === "build" && (
                    <button type="button" onClick={() => openBrief("Interactive Website")}>Start a website project <b>↗</b></button>
                  )}
                  {treasure.links.map((link) => (
                    <a key={link.href} href={link.href} target="_blank" rel="noreferrer">{link.label} <b>↗</b></a>
                  ))}
                </div>
              </div>
            </article>
          ))}
        </div>

        <div className="social-signal">
          <div className="social-signal-heading">
            <p>FOLLOW THE LIVE SIGNAL</p>
            <span>The site is the tree. These channels are where the newest leaves appear first.</span>
          </div>
          <div className="social-signal-grid">
            {socialSignals.map((signal) => (
              <a key={signal.platform} href={signal.href} target="_blank" rel="noreferrer">
                <i>{signal.symbol}</i><span><b>{signal.platform}</b><small>{signal.handle}</small></span><em>↗</em>
              </a>
            ))}
          </div>
        </div>
      </section>

      <section className="story-section" id="process">
        <div className="story-intro">
          <div className="section-index">THE GROWTH CYCLE <span>05 PHASES</span></div>
          <h2>From first spark<br />to <em>living world.</em></h2>
          <p>Drag, swipe or scroll through the StarrTree creation cycle.</p>
        </div>
        <div className="story-track">
          {storyFrames.map((frame, index) => (
            <article className="story-card" key={frame.label}>
              <img src={frame.image} alt="" loading="lazy" />
              <div className="story-shade" />
              <div className="story-card-copy">
                <span>0{index + 1} / 05</span>
                <p>{frame.label}</p>
                <h3>{frame.title}</h3>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="services-section">
        <div className="section-index">WAYS TO WORK TOGETHER <span>SERVICES & BOOKING</span></div>
        <div className="services-title">
          <h2>Bring the idea.<br /><em>We&apos;ll build the world.</em></h2>
          <button className="primary-button" onClick={() => openBrief()}>Start a conversation <span>↗</span></button>
        </div>
        <div className="service-grid">
          {offers.map((offer) => (
            <button className="service-card" key={offer.number} onClick={() => openBrief(offer.project)}>
              <span>{offer.number}</span><i>{offer.status} ↗</i><h3>{offer.title}</h3><p>{offer.copy}</p>
            </button>
          ))}
        </div>
        <CommerceCatalog />
      </section>

      <section className="gallery-section" aria-label="StarrTree visual universe">
        <div className="gallery-heading">
          <p>VISUAL TRANSMISSIONS</p>
          <span>SCROLL / SWIPE</span>
        </div>
        <div className="gallery-track">
          {gallery.map((image, index) => (
            <figure key={image} className={index % 3 === 0 ? "tall" : ""}>
              <img src={image} alt={`StarrTree visual transmission ${String(index + 1).padStart(2, "0")}`} loading="lazy" />
              <figcaption>TRANSMISSION {String(index + 1).padStart(2, "0")}</figcaption>
            </figure>
          ))}
        </div>
      </section>

      <section className="closing-section">
        <img src="/images/world-tree.webp" alt="A luminous StarrTree rising through a living world" loading="lazy" />
        <div className="closing-shade" />
        <div className="closing-copy">
          <p>THE NEXT BRANCH STARTS HERE</p>
          <h2>What world are<br />you trying to <em>grow?</em></h2>
          <button className="primary-button light" onClick={() => openBrief()}>Tell me about it <span>↗</span></button>
        </div>
      </section>

      <footer>
        <div className="footer-brand"><span>✦</span> STARRTREE</div>
        <p>TECH · MUSIC · MEDIA · EDUCATION · WISDOM · DESIGN</p>
        <div className="footer-links">
          <button onClick={() => scrollToId("worlds")}>Explore</button>
          <button onClick={() => openBrief()}>Collaborate</button>
          <a href="mailto:hello@starrtree.org">Email</a>
        </div>
        <small>© {new Date().getFullYear()} MAX STARR. BUILT TO KEEP GROWING.</small>
      </footer>

      <nav className="mobile-dock" aria-label="Mobile navigation">
        <button onClick={() => scrollToId("top")}><span>✦</span>Home</button>
        <button onClick={() => scrollToId("worlds")}><span>◉</span>Worlds</button>
        <button onClick={() => scrollToId("work")}><span>⌁</span>Work</button>
        <button onClick={() => openBrief()}><span>↗</span>Connect</button>
      </nav>

      {menuOpen && (
        <div className="mobile-menu" role="dialog" aria-modal="true" aria-label="Navigation menu">
          <button className="modal-close" onClick={() => setMenuOpen(false)} aria-label="Close menu">×</button>
          <p>STARRTREE / NAVIGATION</p>
          {["worlds", "work", "about"].map((item, index) => (
            <button key={item} onClick={() => { setMenuOpen(false); window.setTimeout(() => scrollToId(item), 50); }}>
              <span>0{index + 1}</span>{item}
            </button>
          ))}
          <button onClick={() => { setMenuOpen(false); openBrief(); }}><span>04</span>start a project</button>
        </div>
      )}

      {openWorld && (
        <div className="world-modal" role="dialog" aria-modal="true" aria-labelledby="world-modal-title">
          <button className="modal-close" onClick={() => setOpenWorld(null)} aria-label="Close world">×</button>
          <div className="world-modal-image">
            <img src={openWorld.image} alt="" />
            <div />
          </div>
          <div className="world-modal-copy" style={{ "--orb-color": openWorld.color } as React.CSSProperties}>
            <p>STARRTREE NODE / {openWorld.number}</p>
            <span className="modal-symbol">{openWorld.symbol}</span>
            <h2 id="world-modal-title">{openWorld.title}</h2>
            <h3>{openWorld.short}</h3>
            <p className="modal-description">{openWorld.description}</p>
            {openWorld.id === "music" && <EPFeature />}
            <div className="modal-projects">
              {openWorld.projects.filter((project) => !["MyPOV", "Sharks & Starrs"].includes(project.name)).map((project) => openWorld.id === "music" && project.name === "Audio Vault" ? (
                <button
                  type="button"
                  className="modal-project-action"
                  key={project.name}
                  onClick={() => {
                    setOpenWorld(null);
                    setMusicOpen(true);
                  }}
                >
                  <span><b>{project.name}</b><small>{project.detail}</small></span>
                  <i>{project.status} ↗</i>
                </button>
              ) : project.href ? (
                <a className="modal-project-action" key={project.name} href={project.href} target="_blank" rel="noreferrer">
                  <span><b>{project.name}</b><small>{project.detail}</small></span>
                  <i>{project.cta ?? project.status} ↗</i>
                </a>
              ) : (
                <div key={project.name}><span><b>{project.name}</b><small>{project.detail}</small></span><i>{project.status}</i></div>
              ))}
            </div>
            <button className="primary-button" onClick={() => { setOpenWorld(null); openBrief(); }}>Build something here <span>↗</span></button>
          </div>
        </div>
      )}

      {musicOpen && (
        <div className="music-vault-backdrop" role="dialog" aria-modal="true" aria-labelledby="music-vault-title">
          <section className="music-vault-modal">
            <button className="modal-close" onClick={() => setMusicOpen(false)} aria-label="Close music vault">×</button>
            <header className="music-vault-heading">
              <p>MUSIC WORLD / AUDIO VAULT</p>
              <h2 id="music-vault-title">Listen beneath<br /><em>the branches.</em></h2>
              <span>Explore the releases. Choose a cover to stream on your favorite platform.</span>
            </header>
            <MusicCatalog />
            <UnreleasedVault />
          </section>
        </div>
      )}

      {briefOpen && (
        <div className="brief-backdrop" role="dialog" aria-modal="true" aria-labelledby="brief-title">
          <div className="brief-modal">
            <button className="modal-close" onClick={closeBrief} aria-label="Close project brief">×</button>
            <p>OPEN A NEW BRANCH</p>
            {formState.succeeded ? (
              <div className="brief-success" role="status">
                <span aria-hidden="true">✦</span>
                <h2 id="brief-title">Your signal<br /><em>came through.</em></h2>
                <p>Thanks. I received your project brief and will follow up through the email you provided.</p>
                <button className="primary-button" type="button" onClick={closeBrief}>Return to StarrTree <span>↗</span></button>
              </div>
            ) : (
              <>
                <h2 id="brief-title">What are we<br /><em>building?</em></h2>
                <form onSubmit={handleFormSubmit}>
                  <input type="hidden" name="_subject" value="New StarrTree project inquiry" />
                  <label>Your name<input name="name" required autoComplete="name" placeholder="How should I address you?" /></label>
                  <label>Email<input type="email" name="email" required autoComplete="email" placeholder="you@example.com" /><ValidationError prefix="Email" field="email" errors={formState.errors} /></label>
                  <label>Project type<select name="project" value={briefProject} onChange={(event) => setBriefProject(event.target.value)}><option value="" disabled>Choose a direction</option><option>AI + Automation</option><option>Creative Direction</option><option>Education + Workshop</option><option>Interactive Website</option><option>Artist Feature</option><option>Vocal Preset / Recording Setup</option><option>Content Partnership</option><option>Music + Visuals</option><option>Something new</option></select></label>
                  <label>Ideal timeline<select name="timeline" defaultValue="Flexible"><option>ASAP</option><option>Within 30 days</option><option>1–3 months</option><option>Flexible</option></select></label>
                  <label className="form-wide">Tell me the vision<textarea name="message" required rows={4} placeholder="What do you want to make real?" /><ValidationError prefix="Message" field="message" errors={formState.errors} /></label>
                  <ValidationError errors={formState.errors} />
                  <button className="primary-button" type="submit" disabled={formState.submitting}>
                    {formState.submitting ? "Sending signal…" : "Send project brief"} <span>↗</span>
                  </button>
                </form>
                <button className="copy-brief" onClick={copyBrief}>{copied ? "Copied to clipboard ✓" : "Or copy a blank project brief"}</button>
              </>
            )}
          </div>
        </div>
      )}
    </main>
  );
}
