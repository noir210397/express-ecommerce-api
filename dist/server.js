"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const app_1 = __importDefault(require("./app"));
// import localtunnel from "localtunnel";
// import { seedData } from "./seeding/seeder"
const PORT = Number(process.env.PORT) || 5000;
function startServer() {
    try {
        app_1.default.listen(PORT, async (err) => {
            if (!err) {
                if (process.env.NODE_ENV === "development") {
                    // const tunnel = await localtunnel({ port: PORT, });
                    console.log(`server running on port:${PORT}`);
                    // console.log(` url:${tunnel.url}`);
                }
                else {
                    console.log(err);
                }
            }
        });
    }
    catch (error) {
        console.log(error);
    }
}
startServer();
