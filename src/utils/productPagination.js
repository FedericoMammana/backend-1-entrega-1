/**
 * Filtros para MongoDB (misma semántica que la consigna)
 */

function escapeRegex(s) {
  return String(s).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export function buildProductMongoFilter(queryParam) {
  if (queryParam == null || String(queryParam).trim() === "") {
    return {};
  }

  const q = String(queryParam).trim();
  const lower = q.toLowerCase();

  if (lower.startsWith("category:")) {
    const val = q.slice("category:".length).trim();
    if (!val) return {};
    return { category: { $regex: escapeRegex(val), $options: "i" } };
  }

  if (lower.startsWith("availability:")) {
    const val = q.slice("availability:".length).trim().toLowerCase();
    const wantAvailable =
      val === "true" || val === "1" || val === "si" || val === "yes";
    return wantAvailable
      ? { status: true, stock: { $gt: 0 } }
      : { $or: [{ status: false }, { stock: { $lte: 0 } }] };
  }

  const term = escapeRegex(q);
  return {
    $or: [
      { title: { $regex: term, $options: "i" } },
      { description: { $regex: term, $options: "i" } },
      { category: { $regex: term, $options: "i" } },
      { code: { $regex: term, $options: "i" } },
    ],
  };
}

export function buildProductMongoSort(sort) {
  if (sort === "asc") return { price: 1 };
  if (sort === "desc") return { price: -1 };
  return { createdAt: -1 };
}

export function buildProductsListLink(req, overrides = {}) {
  const protocol = req.protocol;
  const host = req.get("host");
  const basePath = "/api/products";
  const params = new URLSearchParams();

  const limit = overrides.limit ?? req.query.limit ?? 10;
  const page = overrides.page ?? req.query.page ?? 1;
  const sort = overrides.sort !== undefined ? overrides.sort : req.query.sort;
  const query =
    overrides.query !== undefined ? overrides.query : req.query.query;

  params.set("limit", String(limit));
  params.set("page", String(page));
  if (sort) params.set("sort", String(sort));
  if (query != null && String(query) !== "") params.set("query", String(query));

  const qs = params.toString();
  return `${protocol}://${host}${basePath}${qs ? `?${qs}` : ""}`;
}
