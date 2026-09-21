import { Link } from "react-router-dom";
import { cleanImageUrl, FALLBACK_IMG } from "../../services/api/productApi";
import { useCart } from "../../features/cart/CartContext";
import type { Product } from "../../types/product";

interface ProductCardProps {
  product: Product;
  className?: string;
}

const defaultCardClassName = "flex h-full flex-col text-inherit transition-transform duration-200 hover:-translate-y-1";

export default function ProductCard({ product, className = defaultCardClassName }: ProductCardProps) {
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
    <article className={`${className} flex flex-col`}>
      <Link to={`/${categorySlug}/${productId}`} className="flex min-h-0 flex-1 flex-col text-inherit">
      <div className="card-img-wrapper mb-[14px] flex aspect-square w-full items-center justify-center overflow-hidden rounded-[18px] bg-[#faf5f9] p-5">
        <img
          src={imageSrc}
          alt={product.title}
          loading="lazy"
          decoding="async"
          className="h-full w-full max-h-[200px] max-w-[200px] object-contain mix-blend-multiply"
          onError={(event) => {
            event.currentTarget.onerror = null;
            event.currentTarget.src = FALLBACK_IMG;
          }}
        />
      </div>
      <div className="flex grow flex-col justify-between px-1">
        <p className="mb-5 overflow-hidden text-ellipsis whitespace-nowrap text-[16px] font-bold text-[#111]">{product.title}</p>
        <p className="mb-2 text-[11px] text-[#999]">By {brand}</p>
        <div className="mb-[6px] flex items-baseline gap-2">
          <span className="text-[18px] font-extrabold text-black">${product.price}</span>
          <span className="text-[13px] text-[#aaa] line-through">${oldPrice}</span>
        </div>
        <div className="hidden items-center gap-2 text-[12px]">
          <span className="font-bold text-[#b6349a]">{stockLeft} Left</span>
          <span className="text-[#bbb]">13 Left</span>
        </div>
      </div>
      </Link>
      <button
          type="button"
          className="mt-3 w-full cursor-pointer rounded-[12px] bg-[#b6349a] px-4 py-[10px] text-[14px] font-semibold text-white transition-[background-color,transform] duration-200 hover:bg-[#de57c4] active:scale-[0.98]"
          onClick={(e) => {
            e.preventDefault();
            addToCart(product);
          }}
        >
          Add to Cart
      </button>
    </article>
  );
}
