import { Router } from "express";
import { productManager } from "../managers/productManager.js";
import { cartManager } from "../managers/CartManager.js";
import { buildProductsViewLink } from "../utils/viewLinks.js";

const router = Router();

async function resolveCartId(req) {
  if (req.query.cartId != null && String(req.query.cartId).trim() !== "") {
    return String(req.query.cartId).trim();
  }
  return (await cartManager.getFirstCartId()) || "";
}

// GET / - home con lista de productos
router.get("/", async (req, res) => {
  try {
    const products = await productManager.getAll();
    return res.status(200).render("home", { title: "Home", products });
  } catch (error) {
    return res.status(500).render("home", {
      title: "Home",
      products: [],
      error: "Error leyendo productos",
    });
  }
});

// GET /realtimeproducts
router.get("/realtimeproducts", async (req, res) => {
  try {
    const products = await productManager.getAll();
    return res.status(200).render("realTimeProducts", {
      title: "Productos en tiempo real",
      products,
    });
  } catch (error) {
    return res.status(500).render("realTimeProducts", {
      title: "Productos en tiempo real",
      products: [],
      error: "Error leyendo productos",
    });
  }
});

// GET /products — catálogo con paginación (mismos criterios que GET /api/products)
router.get("/products", async (req, res) => {
  try {
    const sort = req.query.sort;
    if (
      sort != null &&
      sort !== "" &&
      sort !== "asc" &&
      sort !== "desc"
    ) {
      return res.status(400).send("sort debe ser asc, desc o vacío");
    }

    const result = await productManager.paginate({
      limit: req.query.limit,
      page: req.query.page,
      sort: req.query.sort,
      query: req.query.query,
    });

    const prevLink = result.hasPrevPage
      ? buildProductsViewLink(req, { page: result.prevPage })
      : null;
    const nextLink = result.hasNextPage
      ? buildProductsViewLink(req, { page: result.nextPage })
      : null;

    const cartId = await resolveCartId(req);

    const currentSort = sort != null ? String(sort) : "";

    return res.status(200).render("products/index", {
      title: "Catálogo",
      products: result.payload,
      page: result.page,
      totalPages: result.totalPages,
      total: result.total,
      hasPrevPage: result.hasPrevPage,
      hasNextPage: result.hasNextPage,
      prevLink,
      nextLink,
      currentQuery: req.query.query != null ? String(req.query.query) : "",
      currentLimit: result.limit,
      cartId,
      sortNone: !currentSort,
      sortAsc: currentSort === "asc",
      sortDesc: currentSort === "desc",
    });
  } catch (error) {
    return res.status(500).send("Error al cargar productos");
  }
});

// GET /products/:pid — detalle de producto
router.get("/products/:pid", async (req, res) => {
  try {
    const { pid } = req.params;
    const product = await productManager.getById(pid);
    const cartId = await resolveCartId(req);

    if (!product) {
      return res.status(404).render("products/detail", {
        title: "Producto no encontrado",
        error: "Producto no encontrado",
        cartId,
      });
    }

    return res.status(200).render("products/detail", {
      title: product.title,
      product,
      cartId,
    });
  } catch (error) {
    return res.status(500).render("products/detail", {
      title: "Error",
      error: "Error al cargar el producto",
      cartId: await resolveCartId(req),
    });
  }
});

// GET /carts/:cid — carrito con productos populados
router.get("/carts/:cid", async (req, res) => {
  try {
    const { cid } = req.params;
    const cart = await cartManager.getByIdPopulated(cid);

    if (!cart) {
      return res.status(404).render("carts/view", {
        title: "Carrito no encontrado",
        error: "Carrito no encontrado",
        cart: null,
      });
    }

    return res.status(200).render("carts/view", {
      title: `Carrito ${cid}`,
      cart,
    });
  } catch (error) {
    return res.status(500).render("carts/view", {
      title: "Error",
      error: "Error al cargar el carrito",
      cart: null,
    });
  }
});

export default router;
