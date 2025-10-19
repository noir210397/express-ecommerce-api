import dayjs from "dayjs";
import { db } from "src/config/firebase.config";
import stripe from "src/config/stripe.config";
import { DOMAIN_NAMES } from "src/constants/constants";
import { AppError } from "src/errors/api.error";
import { CheckoutV2RequestType } from "src/schemas/checkout.schema";
import { Product } from "src/types/product";
import { UserPayload } from "src/types/user";
import Stripe from "stripe";



export async function checkout(details: CheckoutV2RequestType, user?: UserPayload) {
    const { items } = details
    try {
        // Do all reads first, then writes, inside ONE transaction
        const orderItems = await db.runTransaction(async (t) => {
            const orderItems: Product[] = [];
            const unAvailableItems: { id: string; reason: string; remaining?: number }[] = [];
            // 1) Read pass: fetch all products first (no writes yet)
            const snapshots: { id: string; snap: FirebaseFirestore.DocumentSnapshot }[] = [];
            // Fetch all product docs in parallel
            const productRefs = items.map((item) => db.collection("products").doc(item.id));
            const docs = await t.getAll(...productRefs);
            // Format into snapshots array
            docs.forEach((snap, idx) => {
                snapshots.push({ id: items[idx].id, snap });
            });

            // 2) Validate availability
            for (const item of items) {
                const found = snapshots.find((s) => s.id === item.id);
                if (!found || !found.snap.exists) {
                    unAvailableItems.push({ id: item.id, reason: "does not exist" });
                    continue;
                }
                const product = found.snap.data() as Product;
                if (product.quantity < item.quantity) {
                    unAvailableItems.push({
                        id: item.id,
                        reason: "not enough items",
                        remaining: product.quantity,
                    });
                }
            }

            // If anything is unavailable, abort the transaction (no writes happen)
            if (unAvailableItems.length > 0) {
                throw new AppError(403, undefined, { unAvailableItems });
            }

            // 3) Write pass: decrement stock and build orderItems
            for (const item of items) {
                const found = snapshots.find((s) => s.id === item.id)!;
                const product = found.snap.data() as Product;
                const productRef = db.collection("products").doc(item.id);

                t.update(productRef, { quantity: product.quantity - item.quantity });
                orderItems.push({ ...product, quantity: item.quantity, id: item.id });
            }
            return orderItems
        });
        const order = await db.collection("preorders").add({ items: orderItems })
        let line_items: Stripe.Checkout.SessionCreateParams.LineItem[] = []
        for (const { price, quantity, name, images, description } of orderItems) {
            line_items.push({
                price_data: {
                    currency: "gbp",
                    unit_amount: price * 100,
                    product_data: {
                        name, images, description
                    }
                }, quantity
            })
        }
        const session = await stripe.checkout.sessions.create({
            line_items,
            mode: "payment",
            ui_mode: "embedded",
            expires_at: Math.floor(dayjs().add(35, "minutes").toDate().getTime() / 1000),
            shipping_address_collection: { allowed_countries: ["GB"] },
            shipping_options: [{
                shipping_rate_data: {
                    type: "fixed_amount",
                    fixed_amount: { amount: 300, currency: "gbp" },
                    display_name: "Shipping Fee",
                    delivery_estimate: {
                        minimum: { unit: "business_day", value: 3 },
                        maximum: { unit: "business_day", value: 5 },
                    },
                }
            }],
            automatic_tax: { enabled: true },
            phone_number_collection: { enabled: true },
            payment_method_types: ["card", "paypal",],
            return_url: `${DOMAIN_NAMES[0]}/checkout/payment?session_id={CHECKOUT_SESSION_ID}`,
            metadata: {
                userId: user ? user.uid : null,
                preOrderId: order.id
            }
        })
        return session.client_secret

    } catch (error) {
        if (error instanceof AppError) throw error;
        throw new AppError(500, "checkout failed", error);
    }
}

export async function getCheckout(sessionId: string) {
    try {
        const session = await stripe.checkout.sessions.retrieve(sessionId)
        let response: { status: string, clientSecret?: string }
        switch (session.status) {
            case "expired":
                response = { status: "expired" }
                throw new AppError(400, undefined, response)
            case "open":
                response = { status: "open", clientSecret: session.client_secret! }
                throw new AppError(400, undefined, response)
            default:
                return
        }
    } catch (error) {
        if (error instanceof AppError) throw error
        else throw new AppError(404, undefined, { status: "not_found" })
    }

}
