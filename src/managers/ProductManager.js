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
  async deleteProductById(id) {
    try {
      const products = await this.getAllProducts();
      const updatedProducts = products.filter((product) => product.id !== id);
      if (updatedProducts.length === products.length) {
        return null; // No se encontró el producto a eliminar
      }
      await fs.writeFile(
        this.path,
        JSON.stringify(updatedProducts, null, 2),
        "utf-8",
      );
      return true;
    } catch (error) {
      return false;
    }
  }
  async updateProductById(id, updatedFields) {
    try {
      const products = await this.getAllProducts();
      const productIndex = products.findIndex((product) => product.id === id);
      if (productIndex === -1) {
        return null; // No se encontró el producto a actualizar
      }
      // No permitir modificar el id
      const { id: _ignored, ...safeUpdates } = updatedFields;

      const updatedProduct = {
        ...products[productIndex],
        ...safeUpdates,
        id: products[productIndex].id,
      };

      products[productIndex] = updatedProduct;

      await fs.writeFile(this.path, JSON.stringify(products, null, 2), "utf-8");

      return updatedProduct;
    } catch (error) {
      return null;
    }
  }
}

export const ProductManager = new productManager("./data/products.json");
