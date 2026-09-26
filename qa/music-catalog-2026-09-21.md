# Music catalog and EP promotion

Continues saved repair version 31. No model, orbital motion, intro, typography or overall layout replacement.

- Added all 20 release records and the exact supplied covers to public/images/releases. Original bytes copied, about 1.01 MB total. sourceImage in app/musicReleases.ts preserves image1–image20 association even though Sharks & Starrs is displayed first.
- All 20 DistroKid URLs copied from user mapping. Artist credits included where supplied. Unknown dates and genre labels not invented.
- Existing Audio Vault now uses MusicCatalog, with cover/title/artist/stream action. Unavailable preview buttons removed; optional previewUrl retained for future audio.
- Sharks & Starrs is the first Music project and popup focus: NEW EP, 7 tracks, MyPOV + 6 more, 09.18.26. Primary EP streaming action; MyPOV YouTube and Instagram remain immediately accessible.
- SessionStorage promotion key is specific to Sharks & Starrs. Intro completion gating remains unchanged.

## Validation
- 20 unique records, 20 unique streaming URLs, image indices 1–20 exactly once, all 20 cover files present.
- Isolated desktop browser fixture rendered 20 catalog entries and the EP dialog.
- EP action opened https://distrokid.com/hyperfollow/maxstarr/sharks--starrs-4 with page title 'Sharks & Starrs by Max Starr - DistroKid'.
- Initial focus on Stream the EP; close X tested; suppression after reload tested.
- 390x844 iframe fixture rendered all 20 entries with no horizontal catalog overflow (343px width and scrollWidth). Dialog width 352px, height 538px; CTA at 522–570px, fully visible.
- Browser error logs showed browser-extension metadata messages, no application error observed in these component tests.
- Original cover images shown in user message visually matched titles and mapping. No AI-generated replacement art.
- Test-only routes removed before final production build.
- qa/ep-popup-20260921.jpg is a component test screenshot; background is the catalog fixture, not the live orbital scene.

Previous WebGL desktop mesh-click/native-touch verification blocker remains. This catalog test does not claim that 3D verification passed. Saved without deployment pending that gate.
