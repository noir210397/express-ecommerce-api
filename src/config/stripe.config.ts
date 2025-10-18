import Stripe from "stripe";

const key = process.env.STRIPE_API_KEY
if (!key) {
    throw new Error("stripe api key is not defined")
}
const stripe = new Stripe(key);
export default stripe
