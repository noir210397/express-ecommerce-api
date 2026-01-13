"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createOrderWithTracking = createOrderWithTracking;
const firebase_config_1 = require("../config/firebase.config");
const dayjs_1 = __importDefault(require("dayjs"));
const firestore_1 = require("firebase-admin/firestore");
const format_1 = require("./format");
const mailer_config_1 = require("../config/mailer.config");
// Accepts order data minus createdAt
async function createOrderWithTracking(orderData) {
    const order = await firebase_config_1.db.runTransaction(async (t) => {
        const trackingRef = firebase_config_1.db.collection("tracking").doc("tracking");
        const trackingSnap = await t.get(trackingRef);
        let date;
        let count;
        if (!trackingSnap.exists) {
            // First time init
            date = (0, dayjs_1.default)().startOf("day"); // today at 00:00
            count = 0;
        }
        else {
            const data = trackingSnap.data();
            const storedDate = (0, dayjs_1.default)(data.date.toDate());
            if (storedDate.isBefore((0, dayjs_1.default)().startOf("day"))) {
                // Old date → reset to today 00:00
                date = (0, dayjs_1.default)().startOf("day");
                count = 0;
            }
            else {
                // Still today → continue
                date = storedDate;
                count = data.count;
            }
        }
        // Increment count
        count++;
        // Update tracking
        t.set(trackingRef, {
            date: firestore_1.Timestamp.fromDate(date.toDate()),
            count,
        });
        // Create the order
        const orderRef = firebase_config_1.db.collection("orders").doc();
        const createdAt = firestore_1.Timestamp.fromDate(date.toDate());
        const trackingNumber = (0, format_1.formatTracking)(date.toDate(), count);
        const newOrder = {
            createdAt,
            trackingNumber,
            ...orderData,
        };
        t.set(orderRef, newOrder);
        return newOrder;
    });
    await (0, mailer_config_1.sendAdminOrderNotification)(order);
    await (0, mailer_config_1.sendOrderSuccessEmail)(order);
}
