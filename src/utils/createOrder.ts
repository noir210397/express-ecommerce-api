import { db } from "src/config/firebase.config";
import { Order } from "src/types/order";
import dayjs from "dayjs";
import { Timestamp } from "firebase-admin/firestore";
import { formatTracking } from "./format";
import { sendAdminOrderNotification, sendOrderSuccessEmail } from "src/config/mailer.config";



// Accepts order data minus createdAt
export async function createOrderWithTracking(
    orderData: Omit<Order, "createdAt" | "trackingNumber">
) {
    const order = await db.runTransaction(async (t) => {
        const trackingRef = db.collection("tracking").doc("tracking");
        const trackingSnap = await t.get(trackingRef);
        let date: dayjs.Dayjs;
        let count: number;

        if (!trackingSnap.exists) {
            // First time init
            date = dayjs().startOf("day"); // today at 00:00
            count = 0;
        } else {
            const data = trackingSnap.data() as { date: FirebaseFirestore.Timestamp; count: number };
            const storedDate = dayjs(data.date.toDate());

            if (storedDate.isBefore(dayjs().startOf("day"))) {
                // Old date → reset to today 00:00
                date = dayjs().startOf("day");
                count = 0;
            } else {
                // Still today → continue
                date = storedDate;
                count = data.count;
            }
        }

        // Increment count
        count++;

        // Update tracking
        t.set(trackingRef, {
            date: Timestamp.fromDate(date.toDate()),
            count,
        });

        // Create the order
        const orderRef = db.collection("orders").doc();
        const createdAt = Timestamp.fromDate(date.toDate());
        const trackingNumber = formatTracking(date.toDate(), count)
        const newOrder: Order = {
            createdAt,
            trackingNumber,
            ...orderData,
        };

        t.set(orderRef, newOrder);

        return newOrder;
    });
    await sendAdminOrderNotification(order)
    await sendOrderSuccessEmail(order)
}
