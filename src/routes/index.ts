import { Router } from "express";
import productRoutes from "./product.route"
import authRoutes from "./auth.route"
import orderRoutes from "./order.route"
import checkoutRoutes from "./checkout.route"

const router = Router()


router.use("/product", productRoutes)
router.use("/auth", authRoutes)
router.use("/order", orderRoutes)
router.use("/checkout", checkoutRoutes)


export default router