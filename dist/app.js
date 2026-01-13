"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_middleware_1 = __importDefault(require("./middlewares/cors.middleware"));
const index_1 = __importDefault(require("./routes/index"));
const notfound_middleware_1 = require("./middlewares/notfound.middleware");
const error_middleware_1 = require("./middlewares/error.middleware");
const admin_middleware_1 = require("./middlewares/admin.middleware");
const stripe_webhook_controller_1 = require("./controllers/stripe.webhook.controller");
const mailer_config_1 = require("./config/mailer.config");
const app = (0, express_1.default)();
app.use(cors_middleware_1.default);
app.post("/api/webhook/stripe", express_1.default.raw({ type: 'application/json' }), stripe_webhook_controller_1.stripeWebHookHandler); // Stripe webhook needs the raw body
app.use(express_1.default.json());
app.get("/email", async (req, res) => {
    try {
        await (0, mailer_config_1.sendTestEmail)("Test Email from Vinzinee", "This is a test email to verify the email sending functionality.");
        return res.status(200).send("Test email sent successfully");
    }
    catch (error) {
        console.log(error);
        return res.status(500).send("Failed to send test email");
    }
});
app.use(express_1.default.urlencoded());
app.use(admin_middleware_1.adminAuthMiddleware);
app.use("/api", index_1.default);
app.use(notfound_middleware_1.notfoundHandler);
app.use(error_middleware_1.errorHandler);
exports.default = app;
