import { Router } from "express";
import { cartManager } from "../managers/CartManager.js";
import { productManager } from "../managers/ProductManager.js";
const router = Router();

/// POSTS

// POST /api/carts - creo un nuevo carrito y lo devuelvo
router.post("/", async (req, res) => {
  try {
    const newCart = await cartManager.createCart();
    return res.status(201).json(newCart);
  } catch (error) {
    return res.status(500).json({ message: "Error al crear carrito" });
  }
});
// POST /api/carts/:cid/product/:pid  - agrego un producto al carrito seleccionado
router.post("/:cid/product/:pid", async (req, res) => {
  try {
    const { cid, pid } = req.params;
    const product = await productManager.getById(pid);
    if (!product) {
      return res.status(404).json({ message: "Producto no encontrado" });
    }

    const updatedCart = await cartManager.addProductToCart(cid, pid);

    if (!updatedCart) {
      return res.status(404).json({ message: "Carrito no encontrado" });
    }

    return res.status(200).json(updatedCart);
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Error agregando producto al carrito" });
  }
});

/// GETS

// get /api/carts/:cid  - consulto carrito
router.get("/:cid", async (req, res) => {
  try {
    const { cid } = req.params;

    const cart = await cartManager.getById(cid);

    if (!cart) {
      return res.status(404).json({ message: "Carrito no encontrado" });
    }

    return res.status(200).json(cart.products);
  } catch (error) {
    return res.status(500).json({ message: "Error al leer carrito" });
  }
});

export default router;
