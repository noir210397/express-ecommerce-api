import { RequestHandler } from "express";
import { db } from "src/config/firebase.config";
import stripe from "src/config/stripe.config";
import { Order } from "src/types/order";
import { Product } from "src/types/product";
import { createOrderWithTracking } from "src/utils/createOrder";
import Stripe from "stripe";
const endPointSecret = process.env.STRIPE_WEBHOOK_SECRET
type StripeSessionWithAddress = Stripe.Checkout.Session & {
    shipping_details: Stripe.Checkout.Session.CollectedInformation.ShippingDetails;
};
export const stripeWebHookHandler: RequestHandler = async (req, res) => {
    let event: Stripe.Event;
    if (endPointSecret) {
        const signature = req.headers['stripe-signature'];
        if (!signature) return res.sendStatus(400)

        try {
            event = stripe.webhooks.constructEvent(
                req.body,
                signature,
                endPointSecret
            );
        } catch (err) {
            console.log(`⚠️  Webhook signature verification failed.`, err);
            return res.sendStatus(400);
        }
        res.sendStatus(200)
        let session: StripeSessionWithAddress
        switch (event.type) {
            case "checkout.session.completed":
                session = event.data.object as StripeSessionWithAddress
                await handleCheckoutSuccess(session)
                break;
            case "checkout.session.expired":
                session = event.data.object as StripeSessionWithAddress
                await releaseOrders(session.metadata?.preOrderId!)
                break;
        }
    }
}

async function handleCheckoutSuccess(session: StripeSessionWithAddress) {
    console.log("✅ Payment received! creating order...");

    if (!session.shipping_details.address) {
        throw new Error("❌ Shipping details missing from Stripe session!");
    }
    const doc = await db.collection("preorders").doc(session.metadata?.preOrderId!).get()
    if (!doc.exists) return
    const { items } = doc.data() as { items: Product[] }
    const userId = session.metadata?.userId ?? null
    const shippingAddr = session.shipping_details.address;
    const billingAddr = session.customer_details?.address ?? null;

    const orderData: Omit<Order, "createdAt" | "trackingNumber"> = {

        items,
        name: session.shipping_details.name,
        shippingAddress: [
            shippingAddr.line1,
            shippingAddr.line2,
            shippingAddr.city,
            shippingAddr.postal_code,
            shippingAddr.country,
        ]
            .filter(Boolean)
            .join(", "),
        billingAddress: billingAddr
            ? [
                billingAddr.line1,
                billingAddr.line2,
                billingAddr.city,
                billingAddr.postal_code,
                billingAddr.country,
            ]
                .filter(Boolean)
                .join(", ")
            : "",
        phoneNumber: session.customer_details?.phone ?? "",
        emailAddress: session.customer_details?.email ?? "",
        status: "paid",
        userId
    };

    // ✅ createOrder will handle createdAt + trackingNumber
    await createOrderWithTracking(orderData);
    await db.collection("preorders").doc(session.metadata?.preOrderId!).delete()
}
async function releaseOrders(preOrderId: string) {
    console.log("⚠️ Payment expired! Releasing stock...");

    const doc = await db.collection("preorders").doc(preOrderId).get()
    if (!doc.exists) return
    const { items } = doc.data() as { items: Product[] }
    await db.runTransaction(async (t) => {
        for (const item of items) {
            const productRef = db.collection("products").doc(item.id);
            const snap = await t.get(productRef);

            if (!snap.exists) {
                console.warn(`Product ${item.id} not found when releasing stock`);
                continue;
            }

            const product = snap.data() as Product;

            // Increase the stock back
            t.update(productRef, {
                quantity: product.quantity + item.quantity,
            });
        }
    });
    await db.collection("preorders").doc(preOrderId).delete()
}