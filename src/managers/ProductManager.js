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
    // Comparo como string para evitar problemas entre IDs numéricos y de texto
    return products.find((p) => String(p.id) === String(id)) || null;
  }

  async createProduct(productData) {
    const products = await this.getAll();

    const newId =
      products.length === 0
        ? "1"
        : String(Math.max(...products.map((p) => Number(p.id))) + 1);

    const newProduct = {
      id: newId,
      ...productData,
    };

    products.push(newProduct);

    await fs.writeFile(this.path, JSON.stringify(products, null, 2), "utf-8");

    return newProduct;
  }

  async updateProduct(id, updates) {
    const products = await this.getAll();

    const index = products.findIndex((p) => String(p.id) === String(id));
    if (index === -1) return null;

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

  async deleteProduct(id) {
    const products = await this.getAll();

    const filteredProducts = products.filter(
      (p) => String(p.id) !== String(id),
    );

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
