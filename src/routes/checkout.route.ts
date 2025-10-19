import { Router } from "express";
import { checkoutHandler, getCheckoutSessionHandler, } from "src/controllers/checkout.controller";

const router = Router()

router.post("/", checkoutHandler)
router.get("/", getCheckoutSessionHandler)




export default router