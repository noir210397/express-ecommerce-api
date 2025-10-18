import { Timestamp } from "firebase-admin/firestore"
import { Product } from "./product"
import z from "zod"
export const updateOrderSchema = z.object({
    status: z.enum(["pending", "failed", "shipped", "delivered", "paid"])
})
type OrderStatus = z.infer<typeof updateOrderSchema>


export interface Order extends OrderStatus {
    createdAt: Timestamp
    items: Product[]
    name: string
    shippingAddress: string
    billingAddress: string
    trackingNumber: string
    phoneNumber: string
    emailAddress: string
    status: "paid"
    userId: string | null
}