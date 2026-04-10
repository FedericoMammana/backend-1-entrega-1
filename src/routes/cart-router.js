import { Router } from "express";
import { cartManager } from "../managers/CartManager.js";
import { productManager } from "../managers/productManager.js";

const router = Router();

const getPopulatedCart = (cid) => cartManager.getByIdPopulated(cid);

/// POSTS

router.post("/", async (req, res) => {
  try {
    const newCart = await cartManager.createCart();
    return res.status(201).json(newCart);
  } catch (error) {
    return res.status(500).json({ message: "Error al crear carrito" });
  }
});

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

router.get("/", async (req, res) => {
  try {
    const carts = await cartManager.getAllCarts();
    return res.status(200).json(carts);
  } catch (error) {
    return res.status(500).json({ message: "Error leyendo carritos" });
  }
});

/// Rutas con más segmentos antes que /:cid

// DELETE /api/carts/:cid/products/:pid
router.delete("/:cid/products/:pid", async (req, res) => {
  try {
    const { cid, pid } = req.params;
    const cart = await cartManager.removeProductFromCart(cid, pid);
    if (!cart) {
      return res
        .status(404)
        .json({ message: "Carrito o producto en carrito no encontrado" });
    }
    const populated = await getPopulatedCart(cid);
    return res.status(200).json(populated);
  } catch (error) {
    return res.status(500).json({ message: "Error eliminando producto del carrito" });
  }
});

// PUT /api/carts/:cid/products/:pid — body: { quantity }
router.put("/:cid/products/:pid", async (req, res) => {
  try {
    const { cid, pid } = req.params;
    const { quantity } = req.body;
    if (quantity === undefined) {
      return res.status(400).json({ message: "Se requiere quantity en el body" });
    }
    const cart = await cartManager.updateProductQuantity(cid, pid, quantity);
    if (!cart) {
      return res
        .status(404)
        .json({ message: "Carrito o producto en carrito no encontrado" });
    }
    const populated = await getPopulatedCart(cid);
    return res.status(200).json(populated);
  } catch (error) {
    return res.status(500).json({ message: "Error actualizando cantidad" });
  }
});

// PUT /api/carts/:cid — body: { products: [{ product, quantity }, ...] }
router.put("/:cid", async (req, res) => {
  try {
    const { cid } = req.params;
    const { products } = req.body;
    if (!Array.isArray(products)) {
      return res.status(400).json({ message: "Se requiere products como arreglo" });
    }
    for (const item of products) {
      const p = await productManager.getById(item.product);
      if (!p) {
        return res
          .status(400)
          .json({ message: `Producto no existe: ${item.product}` });
      }
    }
    const cart = await cartManager.updateCartProducts(cid, products);
    if (!cart) {
      return res.status(404).json({ message: "Carrito no encontrado" });
    }
    const populated = await getPopulatedCart(cid);
    return res.status(200).json(populated);
  } catch (error) {
    return res.status(500).json({ message: "Error actualizando carrito" });
  }
});

// DELETE /api/carts/:cid — vacía productos del carrito
router.delete("/:cid", async (req, res) => {
  try {
    const { cid } = req.params;
    const cart = await cartManager.clearCartProducts(cid);
    if (!cart) {
      return res.status(404).json({ message: "Carrito no encontrado" });
    }
    const populated = await getPopulatedCart(cid);
    return res.status(200).json(populated);
  } catch (error) {
    return res.status(500).json({ message: "Error vaciando carrito" });
  }
});

// GET /api/carts/:cid — carrito con productos populados
router.get("/:cid", async (req, res) => {
  try {
    const { cid } = req.params;

    const cart = await getPopulatedCart(cid);

    if (!cart) {
      return res.status(404).json({ message: "Carrito no encontrado" });
    }

    return res.status(200).json(cart);
  } catch (error) {
    return res.status(500).json({ message: "Error al leer carrito" });
  }
});

export default router;
