import { Router } from "express";
import { ProductManager } from "../managers/ProductManager.js";

const router = Router();
// Ruta para obtener todos los productos
router.get("/", async (req, res) => {
  try {
    const products = await productManager.getAllProducts();
    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener los productos" });
  }
});
router.get("/:pid", async (req, res) => {
  try {
    const pid = req.params;
    const product = await productManager.getProductById(pid);
    if (!product) {
      res.status(404).json({ error: "Producto no encontrado" });
    }
    return res.status(200).json(product);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener el producto" });
  }
});
// Ruta para agregar un nuevo producto
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
      thumbnail,
    } = req.body;
    if (
      !title ||
      !description ||
      !code ||
      !price ||
      !status ||
      !stock ||
      !category
    ) {
      return res.status(400).json({ error: "Faltan campos obligatorios" });
    }
    const newProduct = {
      title,
      description,
      code,
      price: Number(price),
      status: Boolean(status),
      stock: Number(stock),
      category,
      thumbnail,
    };
    const addedProduct = await productManager.addProduct(newProduct);
    res.status(201).json(addedProduct);
  } catch (error) {
    res.status(500).json({ error: "Error al agregar el producto" });
  }
});
// Ruta para upgradear un producto existente
router.put("/:pid", async (req, res) => {
  try {
    const pid = req.params;
    const updatedData = await productManager.updateProductById(pid, req.body);
    if (!updatedData) {
      return res.status(404).json({ error: "Producto no encontrado" });
    }
    return res.status(200).json(updatedData);
  } catch (error) {
    res.status(500).json({ error: "Error al actualizar el producto" });
  }
});
// Ruta para eliminar un producto
router.delete("/:pid", async (req, res) => {
  try {
    const pid = req.params;
    const deleted = await productManager.deleteProductById(pid);
    if (!deleted) {
      return res.status(404).json({ error: "Producto no encontrado" });
    }
    return res
      .status(200)
      .json({ message: "Producto eliminado correctamente" });
  } catch (error) {
    res.status(500).json({ error: "Error al eliminar el producto" });
  }
});
export default router;
