import type { Product } from "../../types/product";

const getTrendScore = (product: Product): number => {
  const rating = Math.min(Math.max(product.rating?.rate || 0, 0), 5);
  const ratingCount = Math.max(product.rating?.count || 0, 0);
  const oldPrice = Number(product.oldPrice);
  const discountScore = Number.isFinite(oldPrice) && oldPrice > product.price
    ? Math.min(((oldPrice - product.price) / oldPrice) * 20, 20)
    : 0;

  return rating * 20 + Math.log10(ratingCount + 1) * 4 + discountScore + (product.isNew ? 3 : 0);
};

export const getTrendingProducts = (products: Product[], category = ""): Product[] => {
  return products
    .filter((product) => !category || product.category === category)
    .map((product, index) => ({ product, score: getTrendScore(product), index }))
    .sort((a, b) => b.score - a.score || a.index - b.index)
    .map(({ product }) => product);
};
