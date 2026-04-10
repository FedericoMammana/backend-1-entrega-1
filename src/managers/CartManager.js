import mongoose from "mongoose";
import { Cart } from "../models/Cart.js";
import { productToDTO } from "./productManager.js";

class CartManager {
  /** Primer carrito (para default en vistas si no hay cartId en query) */
  async getFirstCartId() {
    const c = await Cart.findOne().sort({ createdAt: 1 }).select("_id").lean();
    return c?._id?.toString() ?? null;
  }

  async getAllCarts() {
    const docs = await Cart.find().sort({ createdAt: -1 }).lean();
    return docs.map((c) => ({
      id: c._id.toString(),
      products: c.products.map((line) => ({
        product: line.product.toString(),
        quantity: line.quantity,
      })),
    }));
  }

  async getById(id) {
    if (!mongoose.Types.ObjectId.isValid(id)) return null;
    const c = await Cart.findById(id).lean();
    if (!c) return null;
    return {
      id: c._id.toString(),
      products: c.products.map((line) => ({
        product: line.product.toString(),
        quantity: line.quantity,
      })),
    };
  }

  async createCart() {
    const doc = await Cart.create({ products: [] });
    return {
      id: doc._id.toString(),
      products: [],
    };
  }

  async addProductToCart(cid, pid) {
    if (!mongoose.Types.ObjectId.isValid(cid) || !mongoose.Types.ObjectId.isValid(pid)) {
      return null;
    }
    const cart = await Cart.findById(cid);
    if (!cart) return null;

    const pidObj = new mongoose.Types.ObjectId(pid);
    const idx = cart.products.findIndex((p) => p.product.equals(pidObj));
    if (idx === -1) {
      cart.products.push({ product: pidObj, quantity: 1 });
    } else {
      cart.products[idx].quantity += 1;
    }
    await cart.save();

    return {
      id: cart._id.toString(),
      products: cart.products.map((line) => ({
        product: line.product.toString(),
        quantity: line.quantity,
      })),
    };
  }

  async removeProductFromCart(cid, pid) {
    if (!mongoose.Types.ObjectId.isValid(cid) || !mongoose.Types.ObjectId.isValid(pid)) {
      return null;
    }
    const cart = await Cart.findById(cid);
    if (!cart) return null;

    const pidObj = new mongoose.Types.ObjectId(pid);
    const before = cart.products.length;
    cart.products = cart.products.filter((p) => !p.product.equals(pidObj));
    if (cart.products.length === before) return null;

    await cart.save();
    return {
      id: cart._id.toString(),
      products: cart.products.map((line) => ({
        product: line.product.toString(),
        quantity: line.quantity,
      })),
    };
  }

  async updateCartProducts(cid, productsArray) {
    if (!mongoose.Types.ObjectId.isValid(cid)) return null;

    const normalized = (productsArray || [])
      .map((item) => ({
        product: item.product,
        quantity: Math.max(0, Number(item.quantity) || 0),
      }))
      .filter((item) => item.quantity > 0 && mongoose.Types.ObjectId.isValid(item.product))
      .map((item) => ({
        product: new mongoose.Types.ObjectId(item.product),
        quantity: item.quantity,
      }));

    const cart = await Cart.findByIdAndUpdate(
      cid,
      { products: normalized },
      { new: true, runValidators: true }
    );
    if (!cart) return null;

    return {
      id: cart._id.toString(),
      products: cart.products.map((line) => ({
        product: line.product.toString(),
        quantity: line.quantity,
      })),
    };
  }

  async updateProductQuantity(cid, pid, quantity) {
    const qty = Number(quantity);
    if (Number.isNaN(qty) || qty < 0) return null;
    if (!mongoose.Types.ObjectId.isValid(cid) || !mongoose.Types.ObjectId.isValid(pid)) {
      return null;
    }

    const cart = await Cart.findById(cid);
    if (!cart) return null;

    const pidObj = new mongoose.Types.ObjectId(pid);
    const idx = cart.products.findIndex((p) => p.product.equals(pidObj));
    if (idx === -1) return null;

    if (qty === 0) {
      cart.products.splice(idx, 1);
    } else {
      cart.products[idx].quantity = qty;
    }
    await cart.save();

    return {
      id: cart._id.toString(),
      products: cart.products.map((line) => ({
        product: line.product.toString(),
        quantity: line.quantity,
      })),
    };
  }

  async clearCartProducts(cid) {
    if (!mongoose.Types.ObjectId.isValid(cid)) return null;
    const cart = await Cart.findByIdAndUpdate(
      cid,
      { products: [] },
      { new: true }
    );
    if (!cart) return null;
    return {
      id: cart._id.toString(),
      products: [],
    };
  }

  /** Carrito con populate de Mongoose en products.product */
  async getByIdPopulated(cid) {
    if (!mongoose.Types.ObjectId.isValid(cid)) return null;

    const cart = await Cart.findById(cid)
      .populate({ path: "products.product", model: "Product" })
      .lean();

    if (!cart) return null;

    const products = cart.products.map((line) => {
      const populated = line.product;
      const full =
        populated && typeof populated === "object" && populated._id
          ? productToDTO(populated)
          : null;
      const refId =
        populated && typeof populated === "object" && populated._id
          ? populated._id.toString()
          : String(line.product);

      return {
        product: full,
        quantity: line.quantity,
        productId: refId,
      };
    });

    return {
      id: cart._id.toString(),
      products,
    };
  }
}

export const cartManager = new CartManager();
