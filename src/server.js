import express from "express";
import productsRouter from "./routes/products-router.js";
import cartsRouter from "./routes/cart-router.js";

const server = express();

server.use(express.json());
server.use(express.urlencoded({ extended: true }));
server.use("/api/products", productsRouter);
server.use("/api/carts", cartsRouter);

server.listen(8080, () => console.log("Server OK en puerto 8080"));
