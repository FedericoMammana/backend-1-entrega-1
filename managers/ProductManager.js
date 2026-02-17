import fs from "fs";

class productManager {
  constructor(path) {
    this.path = path;
  }

  async getAllProducts() {
    try {
      if (fs.existsSync(this.path)) {
        const data = await fs.promises.readFile(this.path, "utf-8");
        return JSON.parse(data);
      } else {
        return [];
      }
    } catch (error) {
      console.error("Error leyendo productos:", error);
      return [];
    }
  }
  async addProduct(product) {
    try {
      const products = await this.getAllProducts();
      let newId = products.length;
      if (products.length === 0) {
        newId = 1;
      } else {
        newId = products[products.length - 1].id + 1;
      }
      const newProduct = { id: newId, ...product };
      products.push(newProduct);
      await fs.writeFile(this.path, JSON.stringify(products, null, 2));
      return newProduct;
    } catch (error) {
      return [];
    }
  }
  async getProductById(id) {
    try {
      const products = await this.getAllProducts();
      return products.find((product) => product.id === id);
    } catch (error) {
      return null;
    }
  }
}
