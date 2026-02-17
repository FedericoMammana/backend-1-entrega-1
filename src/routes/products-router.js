import { Router } from "express";
import { productManager } from "../managers/ProductManager.js";

const router = Router();

/// GETS ///

// GET /api/products   trae todos los productos
router.get("/", async (req, res) => {
  try {
    const products = await productManager.getAll();
    return res.status(200).json(products);
  } catch (error) {
    return res.status(500).json({ message: "Error leyendo products.json" });
  }
});

// GET /api/products/:pid -> trae el producto con el id indicado
router.get("/:pid", async (req, res) => {
  try {
    const { pid } = req.params;
    const product = await productManager.getById(pid);

    if (!product) {
      return res.status(404).json({ message: "Producto no encontrado" });
    }

    return res.status(200).json(product);
  } catch (error) {
    return res.status(500).json({ message: "Error leyendo products.json" });
  }
});

/// POSTS ///
// POST /api/products  - creo un nuevo producto y lo devuelvo con su id asignado
router.post("/", async (req, res) => {
  try {
    const {
      title,
      description,
      code,
      price,
      status,
      stock,
      category,
      thumbnails,
    } = req.body;

    if (
      !title ||
      !description ||
      !code ||
      price === undefined ||
      status === undefined ||
      stock === undefined ||
      !category ||
      !thumbnails
    ) {
      return res.status(400).json({ message: "Faltan campos obligatorios" });
    }

    const newProduct = await productManager.create({
      title,
      description,
      code,
      price: Number(price),
      status: Boolean(status),
      stock: Number(stock),
      category,
      thumbnails,
    });

    return res.status(201).json(newProduct);
  } catch (error) {
    return res.status(500).json({ message: "Error guardando producto" });
  }
});

/// PUTS ///

// put /api/products/:pid  - actualizo un producto por su id y devuelvo el producto actualizado

router.put("/:pid", async (req, res) => {
  try {
    const { pid } = req.params;

    const updatedProduct = await productManager.update(pid, req.body);

    if (!updatedProduct) {
      return res.status(404).json({ message: "Producto no encontrado" });
    }

    return res.status(200).json(updatedProduct);
  } catch (error) {
    return res.status(500).json({ message: "Error actualizando producto" });
  }
});

router.delete("/:pid", async (req, res) => {
  try {
    const { pid } = req.params;

    const deleted = await productManager.delete(pid);

    if (!deleted) {
      return res.status(404).json({ message: "Product not found" });
    }

    return res.status(200).json({ message: "Product deleted" });
  } catch (error) {
    return res.status(500).json({ message: "Error eliminando producto" });
  }
});

export default router;
