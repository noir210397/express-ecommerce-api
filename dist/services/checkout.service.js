"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkout = checkout;
exports.getCheckout = getCheckout;
const dayjs_1 = __importDefault(require("dayjs"));
const firebase_config_1 = require("../config/firebase.config");
const stripe_config_1 = __importDefault(require("../config/stripe.config"));
const constants_1 = require("../constants/constants");
const api_error_1 = require("../errors/api.error");
async function checkout(details, user) {
    const { items } = details;
    try {
        // Do all reads first, then writes, inside ONE transaction
        const orderItems = await firebase_config_1.db.runTransaction(async (t) => {
            const orderItems = [];
            const unAvailableItems = [];
            // 1) Read pass: fetch all products first (no writes yet)
            const snapshots = [];
            // Fetch all product docs in parallel
            const productRefs = items.map((item) => firebase_config_1.db.collection("products").doc(item.id));
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
                const product = found.snap.data();
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
                throw new api_error_1.AppError(403, undefined, { unAvailableItems });
            }
            // 3) Write pass: decrement stock and build orderItems
            for (const item of items) {
                const found = snapshots.find((s) => s.id === item.id);
                const product = found.snap.data();
                const productRef = firebase_config_1.db.collection("products").doc(item.id);
                t.update(productRef, { quantity: product.quantity - item.quantity });
                orderItems.push({ ...product, quantity: item.quantity, id: item.id });
            }
            return orderItems;
        });
        const order = await firebase_config_1.db.collection("preorders").add({ items: orderItems });
        let line_items = [];
        for (const { price, quantity, name, images, description } of orderItems) {
            line_items.push({
                price_data: {
                    currency: "gbp",
                    unit_amount: price * 100,
                    product_data: {
                        name, images, description
                    }
                }, quantity
            });
        }
        const session = await stripe_config_1.default.checkout.sessions.create({
            line_items,
            mode: "payment",
            ui_mode: "embedded",
            expires_at: Math.floor((0, dayjs_1.default)().add(35, "minutes").toDate().getTime() / 1000),
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
            return_url: `${constants_1.DOMAIN_NAMES[0]}/checkout/payment?session_id={CHECKOUT_SESSION_ID}`,
            metadata: {
                userId: user ? user.uid : null,
                preOrderId: order.id
            }
        });
        return session.client_secret;
    }
    catch (error) {
        if (error instanceof api_error_1.AppError)
            throw error;
        throw new api_error_1.AppError(500, "checkout failed", error);
    }
}
async function getCheckout(sessionId) {
    try {
        const session = await stripe_config_1.default.checkout.sessions.retrieve(sessionId);
        let response;
        switch (session.status) {
            case "expired":
                response = { status: "expired" };
                throw new api_error_1.AppError(400, undefined, response);
            case "open":
                response = { status: "open", clientSecret: session.client_secret };
                throw new api_error_1.AppError(400, undefined, response);
            default:
                return;
        }
    }
    catch (error) {
        if (error instanceof api_error_1.AppError)
            throw error;
        else
            throw new api_error_1.AppError(404, undefined, { status: "not_found" });
    }
}
