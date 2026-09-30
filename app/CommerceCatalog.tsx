"use client";

import { useState } from "react";
import catalog from "./commerce-catalog.json";
import { capacityStatus, testCheckout } from "./commerce-capacity";

type Service = (typeof catalog)[number];
function contact(service: Service, purpose: string) {
  return `mailto:hello@starrtree.org?subject=${encodeURIComponent(`${purpose}: ${service.name}`)}&body=${encodeURIComponent(`Service: ${service.name}\n${service.price}\n\nMy name:\nPreferred timing:\nProject scope / booking details:\n\nPlease confirm capacity and, where applicable, Google Calendar availability before payment. I understand test payments do not purchase a real service.`)}`;
}

function ServiceCard({ service }: { service: Service }) {
  const [approved, setApproved] = useState(false);
  const [checkoutOpened, setCheckoutOpened] = useState(false);
  const booking = service.model.includes("manual booking");
  const deposit = service.model === "One-time deposit";
  const setup = Boolean(service.setupLink);
  const subscription = service.model === "Recurring monthly";
  const discovery = !service.paymentLink && !service.setupLink;
  const status = capacityStatus(service.capacity);
  const unavailable = Boolean(service.capacity) && (status === "unknown" || status === "full");
  const needsApproval = booking || deposit || setup || subscription;
  const link = testCheckout(setup ? service.setupLink : service.paymentLink);
  const cta = booking ? (service.branch === "education" ? "Book Consultation" : "Book Session") : deposit ? "Pay Deposit" : subscription ? "Subscribe" : setup ? "Pay Setup" : "Buy";
  const request = unavailable ? (status === "full" ? "Join Project Queue" : "Request Next Opening") : booking ? "Confirm Availability" : "Start Project";

  return <article className="commerce-card" data-service={service.id}>
    <p className="commerce-category">{service.category}</p>
    <h3>{service.name}</h3>
    <p className="commerce-price">{service.price}</p>
    <p>{service.terms}</p><p>{service.rule}</p>
    {deposit && <p>Deposit only. Scope + deposit → intake → invited kickoff → production → remaining balance. Payment does not reserve immediate production time.</p>}
    {setup && <p>$950 setup is paid separately. The $199/month subscription invitation is shared only after setup delivery.</p>}
    {booking && <p>{service.minutes === "120" ? "Two-hour session." : service.branch === "media" ? "Photo duration is provisional; confirm duration, location and delivery scope first." : "One-hour consultation."} Confirm availability with StarrTree before payment. After payment verification, StarrTree sends your private Google Calendar booking link. Payment alone does not reserve a slot.</p>}
    {booking && <p>Typical windows: {service.availability}. 24-hour notice, 21-day booking horizon. Cancellation/reschedule: 24-hour notice.</p>}
    {service.name === "BandLab Vocal Preset" && <p>Preset delivery is manual after verified payment. Test checkout does not trigger delivery.</p>}
    {service.name === "Starter One-Page Website" && <p>$375 now; remaining $375 before launch.</p>}
    {discovery && <p>Discovery determines the deposit and final scope. The $500 starting price is not a fixed deposit.</p>}
    {unavailable && <p className="commerce-notice">{status === "full" ? "Current project capacity is full." : "Current project capacity needs confirmation."} Request an opening before paying.</p>}
    {(needsApproval || discovery || unavailable) && <a className="commerce-action secondary" href={contact(service, request)}>{request} ↗</a>}
    {!unavailable && !discovery && link && <>
      {needsApproval && <label className="commerce-approval"><input type="checkbox" checked={approved} onChange={event => setApproved(event.target.checked)} />{subscription ? "StarrTree has approved my site for care." : "StarrTree has confirmed my scope and availability / project capacity."}</label>}
      {needsApproval && !approved ? <button className="commerce-action" type="button" disabled>{cta} · confirmation needed</button> : <a className="commerce-action" href={link} target="_blank" rel="noopener noreferrer" onClick={() => setCheckoutOpened(true)}>{cta} · Test Checkout ↗</a>}
      <p className="commerce-next">After checkout: keep the Stripe confirmation and contact StarrTree for {booking ? "payment review and your booking invitation" : deposit || setup ? "intake and the next project step" : "fulfillment and next steps"}. Nothing is reserved automatically.</p>
    </>}
    {checkoutOpened && <div className="commerce-notice" role="status"><strong>Checkout opened in a new tab.</strong><p>Returning here does not confirm payment. If Stripe confirmed your test payment, request manual verification. Test payments do not pay for real services.</p><a href={contact(service, "Review test checkout")}>Request verification & next steps ↗</a></div>}
  </article>;
}

export default function CommerceCatalog({ branch }: { branch?: string }) {
  const services = branch ? catalog.filter(service => service.branch === branch) : catalog;
  if (!services.length) return null;
  return <section className="commerce-catalog" aria-label="StarrTree service catalog">
    <div className="branch-section-title"><h2>Services & booking</h2><span>TEST MODE ONLY</span></div>
    <p className="commerce-banner">Test checkout preview. No real payments or confirmed bookings. All prices in USD. Booking invitations follow manual payment verification; availability is managed in Google Calendar.</p>
    <div className="commerce-grid">{services.map(service => <ServiceCard key={service.id} service={service} />)}</div>
  </section>;
}
