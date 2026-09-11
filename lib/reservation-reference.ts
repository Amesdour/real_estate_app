/**
 * Generates a tracking reference for a reservation hold.
 *
 * There is no payment processor wired in here on purpose — confirming a hold
 * just records that the reservation fee is owed/settled, it doesn't move any
 * money. If a real charge is ever needed later, this is the one place to swap
 * in a payment provider: replace `createHoldReference` with a call that
 * creates a real charge/intent and only returns once it's succeeded.
 */
export function createHoldReference(): string {
  return `hold_${crypto.randomUUID()}`;
}
