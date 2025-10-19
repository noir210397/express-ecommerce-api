import z from "zod"

export const createUserSchema = z.object({
    firstName: z.string("first name is required").trim().min(2),
    lastName: z.string("last name is required").trim().min(2),
    emailAddress: z.email("email address is required"),
    password: z.string().regex(
        /^(?=.*[0-9])(?=.*[A-Z])(?=.*[^A-Za-z0-9]).{8,}$/,
        "Password must be at least 8 characters, include 1 number, 1 uppercase letter, and 1 special character")
})

export type CreateUserType = z.infer<typeof createUserSchema>
export const signInuserSchema = createUserSchema.pick({ emailAddress: true, password: true })
export type SignInUserType = z.infer<typeof signInuserSchema>

export const checkIsAdminSchema = createUserSchema.pick({ emailAddress: true })