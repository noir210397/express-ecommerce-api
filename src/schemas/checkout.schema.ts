import z from "zod"
import { addressSchema, validateId } from "./index"


const checkoutItem = z.object({
    id: validateId,
    quantity: z.int("provide a valid integer").positive("provide a positive number")
})
export const checkoutSchema = z.object({
    items: z.array(checkoutItem).min(1, "at least 1 item is required"),
    firstName: z.string("first name is required").min(2),
    lastName: z.string("last name is required").min(2),
    sameBillingAndShippingAddress: z.boolean().default(false),
    billingAddress: addressSchema.optional(),
    shippingAddress: addressSchema,
    phoneNumber: z.string("phone number is required").regex(/^(?:\+44|44|0)\d{9,10}$/, "please provide a valid UK phone number")
}).superRefine((val, ctx) => {
    const { sameBillingAndShippingAddress, billingAddress } = val
    if (!sameBillingAndShippingAddress && !billingAddress) {
        ctx.addIssue({
            code: "custom",
            path: ["billingAddress"],
            message: "billing address is required when its not same as shipping address"
        })
    }
})
export type CheckoutRequestType = z.infer<typeof checkoutSchema>

export const checkoutSchemaV2 = z.object({
    items: z.array(checkoutItem).min(1, "at least 1 item is required"),
})
export type CheckoutV2RequestType = z.infer<typeof checkoutSchemaV2>