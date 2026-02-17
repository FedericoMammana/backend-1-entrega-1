import e from "express";
import fs from "fs";

export class cartManager {
  constructor(path) {
    this.path = path;
  }
  async getAllCarts() {
    try {
      if (fs.existsSync(this.path)) {
        const data = await fs.promises.readFile(this.path, "utf-8");
        return JSON.parse(data);
      } else {
        return [];
      }
    } catch (error) {
      console.error("Error leyendo carritos:", error);
      return [];
    }
  }
  async getCartById(id) {
    try {
      const carts = await this.getAllCarts();
      return carts.find((cart) => cart.id === id);
    } catch (error) {
      return null;
    }
  }
  async addCart() {
    try {
      const carts = await this.getAllCarts();
      let newId = carts.length;
      if (carts.length === 0) {
        newId = 1;
      } else {
        newId = carts[carts.length - 1].id + 1;
      }
      const newCart = { id: newId, products: [] };
      carts.push(newCart);
      await fs.writeFile(this.path, JSON.stringify(carts, null, 2), "utf-8");
      return newCart;
    } catch (error) {
      return [];
    }
  }
  async addProductToCart(cartId, productId) {
    try {
      const carts = await this.getAllCarts();
      const cartIndex = carts.findIndex((cart) => cart.id === cartId);
      if (cartIndex === -1) {
        return null;
      }
      const cart = carts[cartIndex];
      const productIndex = cart.products.findIndex(
        (product) => product.id === productId,
      );
      if (productIndex === -1) {
        cart.products.push({ id: productId, quantity: 1 });
      } else {
        // ya existe el producto en el carrito, incrementamos la cantidad
        cart.products[productIndex].quantity += 1;
      }
      carts[cartIndex] = cart;
      await fs.writeFile(this.path, JSON.stringify(carts, null, 2), "utf-8");
      return cart;
    } catch (error) {
      return null;
    }
  }
}
export const cartsManager = new cartManager(".data/carts.json");
