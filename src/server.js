import "dotenv/config";
import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import { engine } from "express-handlebars";
import path from "path";
import { fileURLToPath } from "url";

import { connectDatabase } from "./config/database.js";
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

app.set("io", io);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api/products", productsRouter);
app.use("/api/carts", cartsRouter);
app.use("/", viewsRouter);

app.use((err, req, res, next) => {
  console.error(err);
  if (res.headersSent) {
    return next(err);
  }
  if (req.path.startsWith("/api")) {
    return res.status(500).json({ message: "Error interno del servidor" });
  }
  return res.status(500).send("Error interno del servidor");
});

const PORT = Number(process.env.PORT) || 8080;

async function start() {
  await connectDatabase();
  httpServer.listen(PORT, () =>
    console.log(`Server OK en puerto ${PORT} | http://localhost:${PORT}`)
  );
}

start().catch((err) => {
  console.error("No se pudo iniciar el servidor:", err.message);
  process.exit(1);
});
