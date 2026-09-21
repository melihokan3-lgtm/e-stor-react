import { Link } from "react-router-dom";
import { cleanImageUrl, FALLBACK_IMG } from "../../services/api/productApi";
import { useCart } from "../../features/cart/CartContext";
import type { Product } from "../../types/product";

export default function SearchProductCard({ product }: { product: Product }) {
  const categorySlug = product.category.toLowerCase().replace(/\s+/g, "-") || "category";
  const productId = product.id;
  const { addToCart } = useCart();
  
  const imageSrc = cleanImageUrl(product.image) || cleanImageUrl(product.images?.[0]) || FALLBACK_IMG;

  const oldPrice = (product.price * 1.2).toFixed(2);

  return (
    <article className="group flex h-full min-w-0 flex-col no-underline">
      <Link to={`/${categorySlug}/${productId}`} className="flex min-h-0 flex-1 flex-col no-underline">
      <div className="mb-4 flex aspect-square w-full shrink-0 items-center justify-center overflow-hidden rounded-[20px] bg-[#fcf5fb] p-[30px]">
        <img
          src={imageSrc}
          alt={product.title}
          width={200}
          height={200}
          loading="lazy"
          decoding="async"
          className="h-full w-full max-h-[200px] max-w-[200px] object-contain"
          onError={(event) => {
            event.currentTarget.onerror = null;
            event.currentTarget.src = FALLBACK_IMG;
          }}
        />
      </div>
      <div className="flex flex-1 flex-col gap-1.5">
        <p
          className="m-0 line-clamp-2 h-[2.8em] overflow-hidden break-words text-sm font-medium leading-[1.4] text-[#111]"
          title={product.title || "This is product a"}
        >
          {product.title || "This is product a"}
        </p>
        <p className="m-0 truncate whitespace-nowrap text-xs text-[#555]">$2.71/lb</p>
        <div className="flex items-baseline gap-1.5">
          <span className="text-base font-extrabold text-[#111]">${product.price || "99.99"}</span>
          <span className="text-xs text-[#999] line-through">${oldPrice || "99.99"}</span>
        </div>
      </div>
      </Link>
      <button
        type="button"
        className="mt-3 w-full cursor-pointer rounded-xl border-0 bg-[#b6349a] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#9d2d85] active:scale-[0.98]"
        onClick={() => addToCart(product)}
      >
        Add to Cart
      </button>
    </article>
  );
}
