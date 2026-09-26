# StarrTree

Migrated from the current StarrTree Cosmic Portfolio Sites source, commit
`88994d9d35737ada4436b33ed3913b91d77143f2`, on September 26, 2026.
This repository is the development source. No production hosting or domain changes were made.

## Local development

Requires Node.js >=22.13.0 and npm.

```sh
npm ci
npm run dev
```

Use the URL printed by Vite. Production build and local serving:

```sh
npm run build
npm start
```

`npm start -- --port 3000` selects a port. No environment variables are required
for the current public site. WebGL-capable browser/GPU support is required for the 3D scene.

## Implementation

Existing React 19, TypeScript, Vinext 0.0.50 / Vite 8, Next-compatible App Router,
Three.js / React Three Fiber / Drei, GSAP and Tailwind dependencies are retained.
The Cloudflare local/build adapter is retained; this does not deploy anything.
Normal npm scripts no longer call Sites execution helpers or require Work mode.
The original production Sites project ID was removed from the copied configuration
so this checkout is not bound to that production project.

- `app/OrbitalPortfolio.tsx`: intro, orbital nodes, StarrX, 3D animations and expanded views.
- `app/page.tsx`, `BranchGallery.tsx`, `StarrFX.tsx`: page, navigation, branch content and effects.
- `MusicCatalog.tsx`, `UnreleasedVault.tsx`, `ReleasePromotion.tsx`: music, vault and release popup.
- `public/`: original artwork, covers, fonts, audio, plus 11 downloaded original GLB models.
- The remaining source, configuration, lockfile and existing QA notes are preserved.

No UI reconstruction was required. Only model URL localization and local execution
configuration changed. Existing historical QA documents are not verification of this migration.

## External resources retained

- Existing YouTube embeds/thumbnails, Squarespace-hosted profile photo, Formspree
  project form and social/streaming destination links are unchanged third-party resources.
- StarrX still links to the separate Max Starr biography Site; that site is outside this migration.
- Drei's existing Draco decoder CDN and font runtime requests remain unchanged.
  Models themselves, including embedded textures, are now local without recompression.
- No form submissions or external account changes were performed.

## Migration verification and remaining gate

- `npm ci`: passed (576 packages).
- `npm run build`: passed; existing large-chunk warning retained without optimization.
- `npm start`: passed; production HTML, cover image, audio and a GLB returned HTTP 200.
- All 11 downloaded GLBs passed container header/version/length validation.
- Source scan found no common private-key/token patterns; unrelated uploaded files were not included.
- Desktop preview: intro activation, release popup appearance/dismissal and Music tab content passed.
  MyPOV links match the live site's URLs.
- BLOCKED: browser reports `THREE.WebGLRenderer: Error creating WebGL context.`
  Closing the live tab and reloading once did not resolve it. Therefore 3D rendering,
  orb interactions, StarrX click, full desktop parity, mobile/touch parity and external
  destination reachability are NOT certified. Source parity alone is not a substitute.

Next action: complete one desktop and one mobile/touch parity pass in a WebGL-capable browser.
No deployment or domain cutover is required to finish that verification.
