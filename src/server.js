import express from "express";
import productsRouter from "./routes/products-router.js";
import cartRouter from "./routes/cart-router.js";

const server = express();
server.use(express.json());
server.use(express.urlencoded({ extended: true }));
server.use("/api/products", productsRouter);
server.use("/api/carts", cartRouter);
server.listen(8080, () => {
  console.log("Servidor escuchando en el puerto 8080");
});
