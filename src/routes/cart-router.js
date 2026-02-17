import { Router } from "express";
import { cartsManager } from "../managers/CartManager.js";
import { ProductManager } from "../managers/ProductManager.js";

const router = Router();
//Ruta para crear un nuevo carrito
router.post("/", async (req, res) => {
  try {
    const newCart = await cartsManager.addCart();
    res.status(201).json(newCart);
  } catch (error) {
    res.status(500).json({ error: "Error al crear el carrito" });
  }
});

// Ruta para agregar un producto a un carrito específico
router.post("/:cid/product/:pid", async (req, res) => {
  try {
    const { cid, pid } = req.params;
    const product = await ProductManager.getProductById(parseInt(pid));
    if (!product) {
      return res.status(404).json({ error: "Producto no encontrado" });
    }

    const updatedCart = await cartsManager.addProductToCart(
      parseInt(cid),
      parseInt(pid),
    );
    if (!updatedCart) {
      return res.status(404).json({ error: "Carrito no encontrado" });
    }
    res.status(200).json(updatedCart);
  } catch (error) {
    res.status(500).json({ error: "Error al agregar el producto al carrito" });
  }
});
// Ruta para obtener un carrito por su ID
router.get("/:cid", async (req, res) => {
  try {
    const { cid } = req.params;
    const cart = await cartsManager.getCartById(cid);
    if (!cart) {
      return res.status(404).json({ error: "Carrito no encontrado" });
    }
    res.json(cart.products);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener el carrito" });
  }
});
export default router;
