import { Router } from "express";
import { productManager } from "../managers/productManager.js";

const router = Router();

// GET / - home con lista de productos
router.get("/", async (req, res) => {
  try {
    const products = await productManager.getAll();
    return res.status(200).render("home", { title: "Home", products });
  } catch (error) {
    return res.status(500).render("home", { title: "Home", products: [], error: "Error leyendo productos" });
  }
});

// GET /realtimeproducts - lista de productos con actualización por WebSocket
router.get("/realtimeproducts", async (req, res) => {
  try {
    const products = await productManager.getAll();
    return res.status(200).render("realTimeProducts", { title: "Productos en tiempo real", products });
  } catch (error) {
    return res.status(500).render("realTimeProducts", { title: "Productos en tiempo real", products: [], error: "Error leyendo productos" });
  }
});

export default router;
