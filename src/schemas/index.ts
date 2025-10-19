import z from "zod"

export const validateId = z.string("provide a valid Id").regex(/^[A-Za-z0-9]{20}$/, "Invalid Firestore auto ID");
const ukPostcodePattern =
    /^[A-Z]{1,2}\d[A-Z\d]?\s?\d[A-Z]{2}$/i;


export const addressSchema = z.object({
    postCode: z.string()
        .trim()
        .regex(ukPostcodePattern, "Invalid UK postcode"),
    streetAddress: z
        .string()
        .trim()
        .min(1, "Street address is required"),
    town: z
        .string()
        .trim()
        .min(1, "Town is required")

})
export type Address = z.infer<typeof addressSchema>