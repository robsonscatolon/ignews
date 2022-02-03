import { NextApiRequest, NextApiResponse } from "next";
import { Readable } from "stream";
import Stripe from "stripe";
import { stripe } from "../../services/stripe";
import { saveSubscription } from "./_lib/manageSubscription";

async function buffer(readable: Readable) {
  const chunks = [];

  for await (const chunk of readable) {
    chunks.push(typeof chunk === "string" ? Buffer.from(chunk) : chunk);
  }

  return Buffer.concat(chunks);
}

const relevantEvents = new Set([
  "checkout.session.completed",
  "customer.subscriptions.deleted",
  "customer.subscriptions.updated",
]);

export const config = {
  api: {
    bodyParser: false,
  },
};
export default async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === "POST") {
    const buf = await buffer(req);
    const secret = req.headers["stripe-signature"];

    let stripeEvent: Stripe.Event;

    try {
      stripeEvent = stripe.webhooks.constructEvent(
        buf,
        secret,
        process.env.STRIPE_WEBHOOK_SECRET
      );
    } catch (err) {
      console.log(`Webhook error: ${err.message}`);
      return res.status(400).send(`Webhook error: ${err.message}`);
    }

    const { type } = stripeEvent;

    if (relevantEvents.has(type)) {
      try {
        switch (type) {
          case "customer.subscription.deleted":
          case "customer.subscription.updated":
            const customerSubscriptionEvent = stripeEvent.data
              .object as Stripe.Subscription;

            await saveSubscription(
              customerSubscriptionEvent.id,
              customerSubscriptionEvent.customer.toString(),
              false
            );

            break;
          case "checkout.session.completed":
            const checkoutSession = stripeEvent.data
              .object as Stripe.Checkout.Session;
            await saveSubscription(
              checkoutSession.subscription.toString(),
              checkoutSession.customer.toString(),
              true
            );
            break;
          default:
            throw new Error("Unhandled event.");
        }
      } catch (err) {
        console.log(`Webhook handler failed: ${err.message}`);
        return res.json({ error: "Webhook handler failed." });
      }
    }
  } else {
    res.setHeader("Allow", "POST");
    res.status(405).end("Method not allowed");
  }

  res.json({ received: true });
};
