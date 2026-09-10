/**
 * Payment layer for reservation holds.
 *
 * DEMO MODE (default, no STRIPE_SECRET_KEY set): no network call is made. A fake
 * intent id prefixed "demo_" is returned and the reservation is marked confirmed
 * immediately. This is clearly labeled in the UI — it is NOT a working payment
 * integration, it exists so the reservation flow can be exercised end-to-end
 * without a Stripe account.
 *
 * LIVE TEST MODE (STRIPE_SECRET_KEY set, e.g. sk_test_...): creates a real Stripe
 * PaymentIntent via the REST API. Confirmation still needs to happen client-side
 * with Stripe.js/Elements using the returned client_secret — that piece is not
 * wired into the UI in this build (see README "What's stubbed").
 */

type CreateIntentResult = {
  intentId: string;
  clientSecret: string | null;
  demo: boolean;
};

export async function createPaymentIntent(
  amount: number,
  currency = "usd"
): Promise<CreateIntentResult> {
  const secretKey = process.env.STRIPE_SECRET_KEY;

  if (!secretKey || secretKey === "your_stripe_test_secret_key_here") {
    return {
      intentId: `demo_${crypto.randomUUID()}`,
      clientSecret: null,
      demo: true,
    };
  }

  const amountInCents = Math.round(amount * 100);
  const res = await fetch("https://api.stripe.com/v1/payment_intents", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${secretKey}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      amount: String(amountInCents),
      currency,
      "automatic_payment_methods[enabled]": "true",
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Stripe error creating PaymentIntent: ${body}`);
  }

  const data = await res.json();
  return { intentId: data.id, clientSecret: data.client_secret, demo: false };
}
