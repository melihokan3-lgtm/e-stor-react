import { Link } from "react-router-dom";
import { useContext } from "react";
import { cleanImageUrl, FALLBACK_IMG } from "../services/api";
import { CartContext } from "../context/CartContext";

export default function SearchProductCard({ product }) {
  const categorySlug =
    (typeof product.category === 'string' ? product.category : product.category?.name)?.toLowerCase().replace(/\s+/g, "-") ||
    "category";
  const productId = product.id;
  const { addToCart } = useContext(CartContext);
  
  const imageSrc = product.image || cleanImageUrl(product.images?.[0]) || FALLBACK_IMG;

  const oldPrice = (product.price * 1.2).toFixed(2);
  const stockLeft = (product.id % 15) + 1;

  return (
    <Link to={`/${categorySlug}/${productId}`} className="search-product-card">
      <div className="search-card-img-wrapper">
        <img
          src={imageSrc}
          alt={product.title}
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = FALLBACK_IMG;
          }}
        />
      </div>
      <div className="search-card-content">
        <p className="search-card-title" title={product.title || "This is product a"}>
          {product.title || "This is product a"}
        </p>
        <p className="search-card-unit">$2.71/lb</p>
        <div className="search-card-prices">
          <span className="search-card-price-new">${product.price || "99.99"}</span>
          <span className="search-card-price-old">${oldPrice || "99.99"}</span>
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
