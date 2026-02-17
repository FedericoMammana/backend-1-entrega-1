import fs from "fs/promises";

export class ProductManager {
  constructor(path) {
    this.path = path;
  }

  async getAllProducts() {
    const data = await fs.readFile(this.path, "utf-8");
    return JSON.parse(data);
  }

  async getById(id) {
    const products = await this.getAllProducts();
    return products.find((p) => p.id === id) || null;
  }

  async createProduct(productData) {
    const products = await this.getAllProducts();

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
    const products = await this.getAllProducts();

    const index = products.findIndex((p) => p.id === id);
    if (index === -1) return null;

    // Sin modificar el ID, para evitar que se cambie por error
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
