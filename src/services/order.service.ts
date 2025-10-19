import { db } from "src/config/firebase.config";
import { AppError } from "src/errors/api.error";
import { Order } from "src/types/order";
import { UserPayload } from "src/types/user";

const ordersRef = db.collection("orders")

export async function updateOrder(id: string, status: string) {
    const snapshot = await ordersRef.doc(id).get()
    if (!snapshot.exists) throw new AppError(404, "order not found")
    await ordersRef.doc(id).update({ status })

}
export async function deleteOrder(id: string) {
    const order = await ordersRef.doc(id).get()
    if (!order.exists) throw new AppError(404, "order not found")
    await ordersRef.doc(id).delete()
}

export async function getOrders(user: UserPayload) {
    const query = ordersRef
    if (user.role !== "ADMIN") {
        query.where("userId", "==", user.sub)
    }
    else {
    }
    const snapshot = await query.get()
    const data = snapshot.docs.map(doc => {
        const document = doc.data() as Order
        const { createdAt, ...rest } = document
        return {
            id: doc.id,
            ...rest,
            createdAt: createdAt.toDate()
        }
    })
    return data
}
export async function getSingleOrder(id: string) {
    const order = await ordersRef.doc(id).get()
    if (!order.exists) throw new AppError(404, `order with id:${id} was not found`)
    return {
        id: order.id, ...order.data()
    }
}