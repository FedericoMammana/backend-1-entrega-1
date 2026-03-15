import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import { engine } from "express-handlebars";
import path from "path";
import { fileURLToPath } from "url";

import productsRouter from "./routes/products-router.js";
import cartsRouter from "./routes/cart-router.js";
import viewsRouter from "./routes/views-router.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer);

app.engine(
  "handlebars",
  engine({
    defaultLayout: "main",
    layoutsDir: path.join(__dirname, "views", "layouts"),
  })
);
app.set("view engine", "handlebars");
app.set("views", path.join(__dirname, "views"));

// Para que las rutas puedan hacer emit desde POST/DELETE
app.set("io", io);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/", viewsRouter);
app.use("/api/products", productsRouter);
app.use("/api/carts", cartsRouter);

const PORT = 8080;
httpServer.listen(PORT, () =>
  console.log(`Server OK en puerto ${PORT} | http://localhost:${PORT}`)
);
