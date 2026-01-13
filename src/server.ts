import "dotenv/config"
import app from "./app"
// import localtunnel from "localtunnel";
// import { seedData } from "./seeding/seeder"
const PORT = Number(process.env.PORT) || 5000

function startServer() {
    try {
        app.listen(PORT, async (err) => {
            if (!err) {
                if (process.env.NODE_ENV === "development") {
                    // const tunnel = await localtunnel({ port: PORT, });
                    console.log(`server running on port:${PORT}`)
                    // console.log(` url:${tunnel.url}`);
                }
                else {
                    console.log(err);
                }
            }
        })

    } catch (error) {
        console.log(error)
    }
}

startServer()
