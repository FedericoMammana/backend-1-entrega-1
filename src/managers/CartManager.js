import fs from "fs/promises";

export class CartManager {
  constructor(path) {
    this.path = path;
  }
  /// GETS ///
  async getAllCarts() {
    const data = await fs.readFile(this.path, "utf-8");
    return JSON.parse(data);
  }

  async getById(id) {
    const carts = await this.getAllCarts();
    return carts.find((c) => c.id === id) || null;
  }
  /// Creando Carrito y Agregando Productos al Carrito ///

  async createCart() {
    const carts = await this.getAllCarts();

    const newId =
      carts.length === 0
        ? "1"
        : String(Math.max(...carts.map((c) => Number(c.id))) + 1);

    const newCart = {
      id: newId,
      products: [],
    };

    carts.push(newCart);

    await fs.writeFile(this.path, JSON.stringify(carts, null, 2), "utf-8");

    return newCart;
  }
  /// Agrego un producto al carrito seleccionado ///

  async addProductToCart(cid, pid) {
    const carts = await this.getAllCarts();

    const cartIndex = carts.findIndex((c) => c.id === cid);
    if (cartIndex === -1) return null;

    const cart = carts[cartIndex];

    const productIndex = cart.products.findIndex((p) => p.product === pid);

    if (productIndex === -1) {
      // No existe el producto en el carrito, lo agrego con cantidad 1
      cart.products.push({
        product: pid,
        quantity: 1,
      });
    } else {
      // Si ya existe el producto en el carrito, incremento su cantidad
      cart.products[productIndex].quantity += 1;
    }

    carts[cartIndex] = cart;

    await fs.writeFile(this.path, JSON.stringify(carts, null, 2), "utf-8");

    return cart;
  }
}

export const cartManager = new CartManager("./data/carts.json");
