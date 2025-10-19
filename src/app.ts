import express from "express";
import cors from "./middlewares/cors.middleware";
import allRoutes from "./routes/index"
import { notfoundHandler } from "./middlewares/notfound.middleware";
import { errorHandler } from "./middlewares/error.middleware";
import { adminAuthMiddleware } from "./middlewares/admin.middleware";
import { stripeWebHookHandler } from "./controllers/stripe.webhook.controller";
import { sendTestEmail } from "./config/mailer.config";


const app = express()


app.use(cors)
app.post("/api/webhook/stripe", express.raw({ type: 'application/json' }), stripeWebHookHandler); // Stripe webhook needs the raw body
app.use(express.json())
app.get("/email", async (req, res) => {
    try {
        await sendTestEmail("Test Email from Vinzinee", "This is a test email to verify the email sending functionality.")
        return res.status(200).send("Test email sent successfully");
    } catch (error) {
        console.log(error);
        return res.status(500).send("Failed to send test email");
    }
})
app.use(express.urlencoded())
app.use(adminAuthMiddleware)
app.use("/api", allRoutes)
app.use(notfoundHandler)
app.use(errorHandler)

export default app