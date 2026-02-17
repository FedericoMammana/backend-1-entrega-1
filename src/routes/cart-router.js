import { Router } from "express";
import { cartManager } from "../managers/CartManager.js";
import { productManager } from "../managers/ProductManager.js";
const router = Router();

// POST /api/carts - creo un nuevo carrito y lo devuelvo
router.post("/", async (req, res) => {
  try {
    const newCart = await cartManager.create();
    return res.status(201).json(newCart);
  } catch (error) {
    return res.status(500).json({ message: "Error creando carrito" });
  }
});
// POST /api/carts/:cid/product/:pid  - agrego prod al carrito
router.post("/:cid/product/:pid", async (req, res) => {
  try {
    const { cid, pid } = req.params;
    const product = await productManager.getById(pid);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    const updatedCart = await cartManager.addProductToCart(cid, pid);

    if (!updatedCart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    return res.status(200).json(updatedCart);
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Error agregando producto al carrito" });
  }
});

// get /api/carts/:cid  - consulto carrito
router.get("/:cid", async (req, res) => {
  try {
    const { cid } = req.params;

    const cart = await cartManager.getById(cid);

    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    return res.status(200).json(cart.products);
  } catch (error) {
    return res.status(500).json({ message: "Error leyendo carrito" });
  }
});

export default router;
