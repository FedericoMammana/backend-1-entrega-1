import mongoose from "mongoose";
import { Product } from "../models/Product.js";
import {
  buildProductMongoFilter,
  buildProductMongoSort,
} from "../utils/productPagination.js";

export function productToDTO(doc) {
  if (!doc) return null;
  const plain = doc.toObject ? doc.toObject() : { ...doc };
  const id = plain._id?.toString?.() ?? String(plain._id);
  const { _id, __v, ...rest } = plain;
  return { id, ...rest };
}

class ProductManager {
  async getAll() {
    const docs = await Product.find().sort({ createdAt: -1 }).lean();
    return docs.map((d) => productToDTO(d));
  }

  async getById(id) {
    if (!mongoose.Types.ObjectId.isValid(id)) return null;
    const doc = await Product.findById(id).lean();
    return doc ? productToDTO(doc) : null;
  }

  /**
   * Paginación en MongoDB (filtros + orden + skip/limit)
   */
  async paginate(options) {
    const limit = Math.max(1, Number(options.limit) || 10);
    const page = Math.max(1, Number(options.page) || 1);
    const sort = options.sort;
    const queryParam = options.query;

    const filter = buildProductMongoFilter(queryParam);
    const sortObj = buildProductMongoSort(sort);

    const total = await Product.countDocuments(filter);
    const totalPages = total === 0 ? 0 : Math.ceil(total / limit);
    const safePage =
      totalPages === 0 ? 1 : Math.min(page, Math.max(1, totalPages));
    const skip = (safePage - 1) * limit;

    const docs = await Product.find(filter)
      .sort(sortObj)
      .skip(skip)
      .limit(limit)
      .lean();

    const payload = docs.map((d) => productToDTO(d));
    const hasPrevPage = totalPages > 0 && safePage > 1;
    const hasNextPage = totalPages > 0 && safePage < totalPages;

    return {
      payload,
      totalPages,
      prevPage: hasPrevPage ? safePage - 1 : null,
      nextPage: hasNextPage ? safePage + 1 : null,
      page: safePage,
      hasPrevPage,
      hasNextPage,
      limit,
      total,
    };
  }

  async createProduct(productData) {
    const thumbnails = Array.isArray(productData.thumbnails)
      ? productData.thumbnails
      : productData.thumbnails
        ? [productData.thumbnails]
        : [];

    const doc = await Product.create({
      title: productData.title,
      description: productData.description,
      code: productData.code,
      price: Number(productData.price),
      status: Boolean(productData.status),
      stock: Number(productData.stock),
      category: productData.category,
      thumbnails,
    });
    return productToDTO(doc);
  }

  async updateProduct(id, updates) {
    if (!mongoose.Types.ObjectId.isValid(id)) return null;

    const { id: _ignored, __v, _id, ...raw } = updates;
    const allowed = [
      "title",
      "description",
      "code",
      "price",
      "status",
      "stock",
      "category",
      "thumbnails",
    ];
    const patch = {};
    for (const key of allowed) {
      if (raw[key] !== undefined) patch[key] = raw[key];
    }
    if (patch.price !== undefined) patch.price = Number(patch.price);
    if (patch.stock !== undefined) patch.stock = Number(patch.stock);
    if (patch.status !== undefined) patch.status = Boolean(patch.status);
    if (patch.thumbnails !== undefined) {
      patch.thumbnails = Array.isArray(patch.thumbnails)
        ? patch.thumbnails
        : [patch.thumbnails];
    }

    if (Object.keys(patch).length === 0) {
      const current = await Product.findById(id).lean();
      return current ? productToDTO(current) : null;
    }

    try {
      const doc = await Product.findByIdAndUpdate(id, patch, {
        new: true,
        runValidators: true,
      }).lean();
      return doc ? productToDTO(doc) : null;
    } catch (e) {
      throw e;
    }
  }

  async deleteProduct(id) {
    if (!mongoose.Types.ObjectId.isValid(id)) return null;
    const res = await Product.findByIdAndDelete(id);
    return res ? true : null;
  }
}

export const productManager = new ProductManager();
