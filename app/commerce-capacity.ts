// Counts from Master X Tracker, reviewed 2026-09-30: THICKER is the active website.
// Operator-managed capacity, not calendar availability. null means unconfirmed.
// Update only after reviewing active projects; never infer zero from missing data.
export const projectCapacity: Record<string, { active: number | null; limit: number }> = {
  websites: { active: 1, limit: 3 },
  automation: { active: 0, limit: 1 },
  receptionist: { active: 0, limit: 1 },
};

export function capacityStatus(group: string | null) {
  if (!group) return "review";
  const entry = projectCapacity[group];
  if (!entry || entry.active === null || !Number.isInteger(entry.active) || entry.active < 0) return "unknown";
  return entry.active >= entry.limit ? "full" : "open";
}

export function testCheckout(link: string | null) {
  // Fail closed if a future catalog edit accidentally inserts a live checkout.
  return link && /^https:\/\/buy\.stripe\.com\/test_[A-Za-z0-9]+$/.test(link) ? link : null;
}
