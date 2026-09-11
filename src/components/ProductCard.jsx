import { Link } from "react-router-dom";
import { useContext } from "react";
import { cleanImageUrl, FALLBACK_IMG } from "../services/api";
import { CartContext } from "../context/CartContext";

export default function ProductCard({ product, className = "premium-product-card" }) {
  const categorySlug =
    (typeof product.category === 'string' ? product.category : product.category?.name)?.toLowerCase().replace(/\s+/g, "-") ||
    "category";
  const productId = product.id;
  const { addToCart } = useContext(CartContext);
  
  // Fake Store API uses `image` instead of `images` array
  const imageSrc = product.image || cleanImageUrl(product.images?.[0]) || FALLBACK_IMG;
  
  // Fake old price and stock for UI purposes to match design
  const oldPrice = (product.price * 1.2).toFixed(2);
  const stockLeft = (product.id % 15) + 1; // Fake stock just for visual
  const brand = (typeof product.category === 'string' ? product.category : product.category?.name) || "Zelle";

  return (
    <Link to={`/${categorySlug}/${productId}`} className={className}>
      <div className="card-img-wrapper">
        <img
          src={imageSrc}
          alt={product.title}
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = FALLBACK_IMG;
          }}
        />
      </div>
      <div className="card-content">
        <p className="card-title">{product.title}</p>
        <p className="card-brand">By {brand}</p>
        <div className="card-prices">
          <span className="card-price-new">${product.price}</span>
          <span className="card-price-old">${oldPrice}</span>
        </div>
        <div className="card-stock">
          <span className="stock-count">{stockLeft} Left</span>
          <span className="stock-count-secondary">13 Left</span>
        </div>
        <button 
          className="quick-add-btn" 
          onClick={(e) => {
            e.preventDefault();
            addToCart({ ...product, unit: 1 });
          }}
        >
          Add to Cart
        </button>
      </div>
    </Link>
  );
}
