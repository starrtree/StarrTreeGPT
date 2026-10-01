# Run 2: test commerce integration

Source: Revenue OS, Service Catalog A1:V20 and Booking Rules A1:C37, read September 30, 2026 UTC. Run 1 objects were reused without modification.

## Implementation

- `app/commerce-catalog.json`: 19 public service records copied from Revenue OS. Existing test Payment Links only. Private Calendar URLs and the receptionist subscription link are intentionally omitted from public data.
- `app/commerce-capacity.ts`: manually maintained project counts with limits of 3 websites, 1 complex automation and 1 receptionist implementation. Unknown counts fail closed to Request Next Opening. At limit, Join Project Queue replaces checkout. Master X Tracker review supplied current counts: 1 website (THICKER), 0 complex automation, 0 receptionist implementations, recorded September 30, 2026. These are a snapshot, not a live tracker sync.
- `app/CommerceCatalog.tsx`: shared service cards in the existing services section and relevant branch galleries. Direct purchase, deposit, subscription, setup and booking copy is distinct. Test URLs are allowlisted. No Stripe keys or custom backend needed.
- Existing public contact address `hello@starrtree.org` receives customer-created inquiries through mailto links. Clicking a request opens the visitor's email application; no queue record or email is automatically submitted by the website.

## Manual operator workflow

1. Review project capacity before accepting deposits. Update the explicit counts in `app/commerce-capacity.ts` and redeploy after each capacity change. Null does not mean zero. Static counts do not enforce concurrency atomically; manual review remains required.
2. Confirm scope and Calendar availability before asking a timed-service customer to pay. Check the global 3-meeting limit and the service-specific limits in Revenue OS. Website checkbox is an acknowledgment, not an authorization or payment gate.
3. Verify the correct payment in Stripe. Test transactions never count as real payment. Share the matching private Calendar URL from Revenue OS only after verification. Do not treat a return to the website as payment success. Google Calendar continues to control available times and busy-event conflicts.
4. For receptionist work, approve capacity, collect the separate $950 setup payment, deliver setup, then privately share the existing $199/month subscription link from Service Catalog K. It is not exposed in the public catalog.
5. Workshop deposit follows discovery; do not use the $500 starting Price as a fixed deposit. Confirm provisional photo duration/location/deliverables and arrange manual preset delivery.

## Verification and stopping condition

- `npm run build:vercel`: PASS after npm ci restored the current lockfile dependencies.
- `node --test tests/commerce.test.mjs`: 4/4 PASS. Four representative data/render checks cover Poster / Flyer Design, Custom GPT / AI Assistant deposit, Website Care, and AI consultation. These do not substitute for browser checkout checks.
- Secret-pattern scan of changed files: PASS. Attached credential files were not opened or added.
- `npx tsc --noEmit` reports errors in unchanged StarrFX canvas nullability and Cloudflare worker typings; no commerce-file errors were reported. These unrelated issues were left untouched.
- October 1, 2026: user-provided Vercel share access worked for preview commit `cf69c6e`. Desktop catalog interaction verified in the cloud browser at 1363 CSS pixels wide.
- A: Poster / Flyer Design Buy CTA opened the existing Stripe Sandbox checkout, $125.00, full payment, two revision rounds. PASS to checkout.
- B: Custom GPT / AI Assistant Starter checkbox enabled Pay Deposit; CTA opened Stripe Sandbox $250.00 initial deposit toward starting $500, with remaining balance and no immediate labor reservation accurately stated. PASS to checkout.
- C: Website Care Plan approval checkbox enabled Subscribe; CTA opened Stripe Sandbox $99.00 per month with recurring authorization copy. PASS to checkout.
- D: Consultation approval checkbox enabled Book Consultation; CTA opened Stripe Sandbox $150.00 for one hour. Website showed manual verification and private Calendar invitation instructions, and explicitly did not claim payment success on return. PASS to checkout/manual next-step presentation.
- No payments, subscriptions, emails, or appointments were submitted. Transaction completion and an actual manual Calendar invitation were not exercised.
- Desktop cards rendered in three columns with readable terms and working controls. Browser reported WebGL unavailable in the existing OrbitalPortfolio 3D component; catalog interactions still worked. No unrelated 3D changes made.
- Mobile/responsive verification remains BLOCKED: available cloud browser exposes no viewport/device emulation control; a browser zoom keyboard attempt left the viewport unchanged. Earlier local Chromium installation had failed, so no repeated installation loop was attempted. Do not claim mobile PASS.
- Stop here under the requested blocker rule. Preserve changes on a review branch; do not merge into main until the four browser flows, desktop and mobile checks pass.

## Minimum remaining work

1. Complete mobile/responsive checks for the same four flows. Desktop CTA destinations and checkout summaries are already verified; retest only affected failures. If transaction completion is required, use Stripe test details only and exercise manual verification/invitation without reserving real availability.
2. After the remaining acceptance checks pass, merge the verified integration into main and confirm its existing Vercel deployment. Before accepting real clients, confirm photo scope/duration, care eligibility, preset fulfillment and receiving mailbox operation; maintain capacity from the tracker.
3. Live activation is a separate authorized task: prepare and verify equivalent live Products/Prices/Payment Links, update the deliberate test-only URL guard and copy, and switch only after live configuration review. Keep booking verification manual and start receptionist recurring billing only after setup delivery. Never treat a test checkout as paid fulfillment.
