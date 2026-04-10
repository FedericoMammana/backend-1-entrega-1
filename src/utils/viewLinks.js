/**
 * Enlaces para vistas HTML /products (mismos query params que la API)
 */
export function buildProductsViewLink(req, overrides = {}) {
  const protocol = req.protocol;
  const host = req.get("host");
  const basePath = "/products";

  const limit = overrides.limit ?? req.query.limit ?? 10;
  const page = overrides.page ?? req.query.page ?? 1;
  const sort = overrides.sort !== undefined ? overrides.sort : req.query.sort;
  const query = overrides.query !== undefined ? overrides.query : req.query.query;
  const cartId = overrides.cartId !== undefined ? overrides.cartId : req.query.cartId;

  const params = new URLSearchParams();
  params.set("limit", String(limit));
  params.set("page", String(page));
  if (sort) params.set("sort", String(sort));
  if (query != null && String(query) !== "") params.set("query", String(query));
  if (cartId != null && String(cartId) !== "") params.set("cartId", String(cartId));

  const qs = params.toString();
  return `${protocol}://${host}${basePath}${qs ? `?${qs}` : ""}`;
}
