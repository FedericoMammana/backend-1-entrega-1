import fs from "fs/promises";

export class ProductManager {
  constructor(path) {
    this.path = path;
  }

  async getAll() {
    const data = await fs.readFile(this.path, "utf-8");
    return JSON.parse(data);
  }

  async getById(id) {
    const products = await this.getAll();
    return products.find((p) => p.id === id) || null;
  }

  async create(productData) {
    const products = await this.getAll();

    const nextId =
      products.length === 0
        ? "1"
        : String(Math.max(...products.map((p) => Number(p.id))) + 1);

    const newProduct = {
      id: nextId,
      ...productData,
    };

    products.push(newProduct);

    await fs.writeFile(this.path, JSON.stringify(products, null, 2), "utf-8");

    return newProduct;
  }

  async update(id, updates) {
    const products = await this.getAll();

    const index = products.findIndex((p) => p.id === id);
    if (index === -1) return null;

    // No permitir modificar el id
    const { id: _ignored, ...safeUpdates } = updates;

    const updatedProduct = {
      ...products[index],
      ...safeUpdates,
      id: products[index].id,
    };

    products[index] = updatedProduct;

    await fs.writeFile(this.path, JSON.stringify(products, null, 2), "utf-8");

    return updatedProduct;
  }

  async delete(id) {
    const products = await this.getAll();

    const filteredProducts = products.filter((p) => p.id !== id);

    if (filteredProducts.length === products.length) {
      return null; // No se encontró el producto a eliminar
    }

    await fs.writeFile(
      this.path,
      JSON.stringify(filteredProducts, null, 2),
      "utf-8",
    );

    return true;
  }
}

export const productManager = new ProductManager("./data/products.json");
