import "dotenv/config"
import { WSServer } from "./server.js";

const PORT = 3004
new WSServer(PORT);

console.log(`ws running on ${PORT}`);
