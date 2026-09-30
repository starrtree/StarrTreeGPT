# Run 2: test commerce integration

Source: Revenue OS, Service Catalog A1:V20 and Booking Rules A1:C37, read September 30, 2026 UTC. Run 1 objects were reused without modification.

## Implementation

- `app/commerce-catalog.json`: 19 public service records copied from Revenue OS. Existing test Payment Links only. Private Calendar URLs and the receptionist subscription link are intentionally omitted from public data.
- `app/commerce-capacity.ts`: manually maintained project counts with limits of 3 websites, 1 complex automation and 1 receptionist implementation. Unknown counts fail closed to Request Next Opening. At limit, Join Project Queue replaces checkout. Counts were not supplied, so all three default to unknown.
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
- Browser verification BLOCKED: installed runtime has no Chromium; one browser installation attempt failed with invalid/truncated download. Cloud browser recovery rejected localhost with ERR_BLOCKED_BY_CLIENT.
- Desktop and mobile customer experience and external checkout summaries remain unverified in Run 2. No payments or appointments were submitted.
- Stop here under the requested blocker rule. Preserve changes on a review branch; do not merge into main until the four browser flows, desktop and mobile checks pass.

## Minimum remaining work

1. In a browser-capable environment, verify A: Poster $125; B: Custom GPT deposit $250 toward starting $500; C: Website Care $99/month; D: consultation $150/hour, manual invitation workflow. Check desktop/mobile. Retest only affected failures.
2. Confirm the current counts, photo scope/duration, care eligibility, and preset fulfillment. Confirm the receiving mailbox works. Then merge the verified integration into main and confirm its existing Vercel deployment.
3. Live activation is a separate authorized task: prepare and verify equivalent live Products/Prices/Payment Links, update the deliberate test-only URL guard and copy, and switch only after live configuration review. Keep booking verification manual and start receptionist recurring billing only after setup delivery. Never treat a test checkout as paid fulfillment.
