import { Link } from "react-router-dom";
import { cleanImageUrl, FALLBACK_IMG } from "../../services/api/productApi";
import { useCart } from "../../features/cart/CartContext";
import type { Product } from "../../types/product";

interface ProductCardProps {
  product: Product;
  className?: string;
}

export default function ProductCard({ product, className = "premium-product-card" }: ProductCardProps) {
  const categorySlug = product.category.toLowerCase().replace(/\s+/g, "-") || "category";
  const productId = product.id;
  const { addToCart } = useCart();
  
  // Fake Store API uses `image` instead of `images` array
  const imageSrc = product.image || cleanImageUrl(product.images?.[0]) || FALLBACK_IMG;
  
  // Fake old price and stock for UI purposes to match design
  const oldPrice = (product.price * 1.2).toFixed(2);
  const stockLeft = (product.id % 15) + 1; // Fake stock just for visual
  const brand = product.category || "Zelle";

  return (
    <Link to={`/${categorySlug}/${productId}`} className={className}>
      <div className="card-img-wrapper">
        <img
          src={imageSrc}
          alt={product.title}
          onError={(event) => {
            event.currentTarget.onerror = null;
            event.currentTarget.src = FALLBACK_IMG;
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
            addToCart(product);
          }}
        >
          Add to Cart
        </button>
      </div>
    </Link>
  );
}
