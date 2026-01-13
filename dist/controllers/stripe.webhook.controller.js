"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.stripeWebHookHandler = void 0;
const firebase_config_1 = require("../config/firebase.config");
const stripe_config_1 = __importDefault(require("../config/stripe.config"));
const createOrder_1 = require("../utils/createOrder");
const endPointSecret = process.env.STRIPE_WEBHOOK_SECRET;
const stripeWebHookHandler = async (req, res) => {
    let event;
    if (endPointSecret) {
        const signature = req.headers['stripe-signature'];
        if (!signature)
            return res.sendStatus(400);
        try {
            event = stripe_config_1.default.webhooks.constructEvent(req.body, signature, endPointSecret);
        }
        catch (err) {
            console.log(`⚠️  Webhook signature verification failed.`, err);
            return res.sendStatus(400);
        }
        res.sendStatus(200);
        let session;
        switch (event.type) {
            case "checkout.session.completed":
                session = event.data.object;
                await handleCheckoutSuccess(session);
                break;
            case "checkout.session.expired":
                session = event.data.object;
                await releaseOrders(session.metadata?.preOrderId);
                break;
        }
    }
};
exports.stripeWebHookHandler = stripeWebHookHandler;
async function handleCheckoutSuccess(session) {
    console.log("✅ Payment received! creating order...");
    if (!session.shipping_details.address) {
        throw new Error("❌ Shipping details missing from Stripe session!");
    }
    const doc = await firebase_config_1.db.collection("preorders").doc(session.metadata?.preOrderId).get();
    if (!doc.exists)
        return;
    const { items } = doc.data();
    const userId = session.metadata?.userId ?? null;
    const shippingAddr = session.shipping_details.address;
    const billingAddr = session.customer_details?.address ?? null;
    const orderData = {
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
    await (0, createOrder_1.createOrderWithTracking)(orderData);
    await firebase_config_1.db.collection("preorders").doc(session.metadata?.preOrderId).delete();
}
async function releaseOrders(preOrderId) {
    console.log("⚠️ Payment expired! Releasing stock...");
    const doc = await firebase_config_1.db.collection("preorders").doc(preOrderId).get();
    if (!doc.exists)
        return;
    const { items } = doc.data();
    await firebase_config_1.db.runTransaction(async (t) => {
        for (const item of items) {
            const productRef = firebase_config_1.db.collection("products").doc(item.id);
            const snap = await t.get(productRef);
            if (!snap.exists) {
                console.warn(`Product ${item.id} not found when releasing stock`);
                continue;
            }
            const product = snap.data();
            // Increase the stock back
            t.update(productRef, {
                quantity: product.quantity + item.quantity,
            });
        }
    });
    await firebase_config_1.db.collection("preorders").doc(preOrderId).delete();
}
