/**
 * Carga datos iniciales desde data/*.json si la BD está vacía.
 * Ejecutar: npm run seed (con MongoDB corriendo y .env configurado)
 */
import "dotenv/config";
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import mongoose from "mongoose";
import { connectDatabase } from "../config/database.js";
import { Product } from "../models/Product.js";
import { Cart } from "../models/Cart.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..", "..");

async function main() {
  await connectDatabase();

  const productCount = await Product.countDocuments();
  if (productCount === 0) {
    const raw = await fs.readFile(
      path.join(root, "data", "products.json"),
      "utf-8"
    );
    const items = JSON.parse(raw);
    const seenCodes = new Set();
    for (const item of items) {
      const { id: _id, ...rest } = item;
      let code = rest.code;
      while (seenCodes.has(code)) {
        code = `${rest.code}_${Math.random().toString(36).slice(2, 6)}`;
      }
      seenCodes.add(code);
      await Product.create({ ...rest, code });
    }
    console.log(`Productos insertados: ${items.length}`);
  } else {
    console.log("Ya existen productos, se omite seed de productos.");
  }

  const cartCount = await Cart.countDocuments();
  if (cartCount === 0) {
    const raw = await fs.readFile(
      path.join(root, "data", "carts.json"),
      "utf-8"
    );
    const carts = JSON.parse(raw);
    const orderedProducts = await Product.find().sort({ createdAt: 1 }).lean();

    for (const c of carts) {
      const lines = [];
      for (const line of c.products || []) {
        const oldIdx = Number(line.product) - 1;
        if (oldIdx >= 0 && oldIdx < orderedProducts.length) {
          lines.push({
            product: orderedProducts[oldIdx]._id,
            quantity: Math.max(1, Number(line.quantity) || 1),
          });
        }
      }
      await Cart.create({ products: lines });
    }
    console.log(`Carritos de ejemplo creados: ${carts.length}`);
  } else {
    console.log("Ya existen carritos, se omite seed de carritos.");
  }

  const firstCart = await Cart.findOne().sort({ createdAt: 1 });
  if (firstCart) {
    console.log("\nPrimer carrito (usar en ?cartId= o en la UI):");
    console.log(firstCart._id.toString());
  }

  await mongoose.disconnect();
  console.log("Seed finalizado.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
