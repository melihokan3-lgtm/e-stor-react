import { Link } from "react-router-dom";
import { cleanImageUrl, FALLBACK_IMG } from "../services/api";
import { useCart } from "../context/CartContext";
import type { Product } from "../types/product";

export default function WeeklyProductCard({ product }: { product: Product }) {
  const categorySlug = product.category.toLowerCase().replace(/\s+/g, "-") || "category";
  const imageSrc = product.image || cleanImageUrl(product.images?.[0]) || FALLBACK_IMG;
  const oldPrice = (product.price * 1.2).toFixed(2);
  const stockLeft = (product.id % 15) + 1;
  const { addToCart } = useCart();

  return (
    <Link
      to={`/${categorySlug}/${product.id}`}
      className="weekly-product-card"
      aria-label={product.title}
    >
      <div className="weekly-product-card__image">
        <img
          src={imageSrc}
          alt={product.title}
          onError={(event) => {
            event.currentTarget.onerror = null;
            event.currentTarget.src = FALLBACK_IMG;
          }}
        />
      </div>
      <p className="weekly-product-card__title">{product.title}</p>
      <p className="weekly-product-card__unit">${Number(product.price).toFixed(2)}/lb</p>
      <div className="weekly-product-card__prices">
        <strong>${Number(product.price).toFixed(2)}</strong>
        <span>${oldPrice}</span>
      </div>
      <div className="weekly-product-card__stock">
        <span>{stockLeft} Left</span>
        <span>12 Left</span>
      </div>
      <button
        className="quick-add-btn"
        onClick={(e) => {
          e.preventDefault();
          addToCart(product);
        }}
      >
        Add to Cart
      </button>
    </Link>
  );
}
