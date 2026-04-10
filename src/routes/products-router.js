import { Router } from "express";
import { productManager } from "../managers/productManager.js";
import { buildProductsListLink } from "../utils/productPagination.js";

const router = Router();

function sendPaginatedResponse(req, res, statusCode, result) {
  const { payload, totalPages, prevPage, nextPage, page, hasPrevPage, hasNextPage } =
    result;

  const prevLink = hasPrevPage
    ? buildProductsListLink(req, { page: prevPage })
    : null;
  const nextLink = hasNextPage
    ? buildProductsListLink(req, { page: nextPage })
    : null;

  return res.status(statusCode).json({
    status: "success",
    payload,
    totalPages,
    prevPage,
    nextPage,
    page,
    hasPrevPage,
    hasNextPage,
    prevLink,
    nextLink,
  });
}

/// GETS ///

// GET /api/products — paginación, filtros (query), orden por precio (sort)
router.get("/", async (req, res) => {
  try {
    const limit = req.query.limit;
    const page = req.query.page;
    const sort = req.query.sort;
    const query = req.query.query;

    if (
      sort != null &&
      sort !== "" &&
      sort !== "asc" &&
      sort !== "desc"
    ) {
      return res.status(400).json({
        status: "error",
        payload: null,
        totalPages: 0,
        prevPage: null,
        nextPage: null,
        page: 1,
        hasPrevPage: false,
        hasNextPage: false,
        prevLink: null,
        nextLink: null,
        message: "sort debe ser asc o desc",
      });
    }

    const result = await productManager.paginate({
      limit,
      page,
      sort,
      query,
    });

    return sendPaginatedResponse(req, res, 200, result);
  } catch (error) {
    return res.status(500).json({
      status: "error",
      payload: null,
      totalPages: 0,
      prevPage: null,
      nextPage: null,
      page: 1,
      hasPrevPage: false,
      hasNextPage: false,
      prevLink: null,
      nextLink: null,
      message: "Error leyendo products.json",
    });
  }
});

// GET /api/products/:pid -- trae el producto con el id indicado
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

    const thumbs = Array.isArray(thumbnails)
      ? thumbnails
      : thumbnails
        ? [thumbnails]
        : [];

    if (
      !title ||
      !description ||
      !code ||
      price === undefined ||
      status === undefined ||
      stock === undefined ||
      !category ||
      thumbs.length === 0
    ) {
      return res.status(400).json({ message: "Faltan campos obligatorios" });
    }

    const newProduct = await productManager.createProduct({
      title: String(title).trim(),
      description: String(description).trim(),
      code: String(code).trim(),
      price: Number(price),
      status: Boolean(status),
      stock: Number(stock),
      category: String(category).trim(),
      thumbnails: thumbs,
    });

    const io = req.app.get("io");
    if (io) {
      const products = await productManager.getAll();
      io.emit("productList", products);
    }

    return res.status(201).json(newProduct);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ message: "Ya existe un producto con ese código" });
    }
    if (error.name === "ValidationError") {
      return res.status(400).json({ message: error.message });
    }
    return res.status(500).json({ message: "Error guardando producto" });
  }
});

/// PUTS ///

// put /api/products/:pid  - Actualizo un producto por su id y devuelvo el producto actualizado

router.put("/:pid", async (req, res) => {
  try {
    const { pid } = req.params;

    const updatedProduct = await productManager.updateProduct(pid, req.body);

    if (!updatedProduct) {
      return res.status(404).json({ message: "Producto no encontrado" });
    }

    return res.status(200).json(updatedProduct);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ message: "Ya existe un producto con ese código" });
    }
    if (error.name === "ValidationError") {
      return res.status(400).json({ message: error.message });
    }
    return res.status(500).json({ message: "Error actualizando producto" });
  }
});

/// DELETES ///

router.delete("/:pid", async (req, res) => {
  try {
    const { pid } = req.params;

    const deleted = await productManager.deleteProduct(pid);

    if (!deleted) {
      return res.status(404).json({ message: "Producto no encontrado" });
    }

    const io = req.app.get("io");
    if (io) {
      const products = await productManager.getAll();
      io.emit("productList", products);
    }

    return res.status(200).json({ message: "Producto eliminado" });
  } catch (error) {
    return res.status(500).json({ message: "Error eliminando producto" });
  }
});

export default router;
