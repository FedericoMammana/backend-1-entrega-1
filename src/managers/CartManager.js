import fs from "fs/promises";

export class CartManager {
  constructor(path) {
    this.path = path;
  }

  async getAll() {
    const data = await fs.readFile(this.path, "utf-8");
    return JSON.parse(data);
  }

  async getById(id) {
    const carts = await this.getAll();
    return carts.find((c) => c.id === id) || null;
  }

  async addProductToCart(cid, pid) {
    const carts = await this.getAll();

    const cartIndex = carts.findIndex((c) => c.id === cid);
    if (cartIndex === -1) return null;

    const cart = carts[cartIndex];

    const productIndex = cart.products.findIndex((p) => p.product === pid);

    if (productIndex === -1) {
      // No existe en el carrito entonces lo agrego por primera vez
      cart.products.push({
        product: pid,
        quantity: 1,
      });
    } else {
      // Ya existe entonces incremento la cant
      cart.products[productIndex].quantity += 1;
    }

    carts[cartIndex] = cart;

    await fs.writeFile(this.path, JSON.stringify(carts, null, 2), "utf-8");

    return cart;
  }

  async create() {
    const carts = await this.getAll();

    const nextId =
      carts.length === 0
        ? "1"
        : String(Math.max(...carts.map((c) => Number(c.id))) + 1);

    const newCart = {
      id: nextId,
      products: [],
    };

    carts.push(newCart);

    await fs.writeFile(this.path, JSON.stringify(carts, null, 2), "utf-8");

    return newCart;
  }
}

export const cartManager = new CartManager("./data/carts.json");
