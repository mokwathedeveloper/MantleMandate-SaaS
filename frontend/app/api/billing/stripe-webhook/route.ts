import { NextResponse } from 'next/server'

export const runtime = 'nodejs'

// Card payments are not yet connected to a payment provider. To activate:
//   1. Create a Stripe account and a product/price for each plan.
//   2. Set STRIPE_SECRET_KEY and STRIPE_WEBHOOK_SECRET in .env.local.
//   3. Verify the webhook signature with `stripe.webhooks.constructEvent`,
//      handle `checkout.session.completed` / `invoice.paid` by inserting into
//      `public.invoices` (payment_method='card') and updating `profiles.plan`.
//   4. Point your Stripe webhook endpoint at this route.
export async function POST() {
  return NextResponse.json({ error: 'Stripe is not configured for this deployment' }, { status: 501 })
}
