import { Link } from "react-router-dom";
import { cleanImageUrl, FALLBACK_IMG } from "../../services/api/productApi";
import { useCart } from "../../features/cart/CartContext";
import type { Product } from "../../types/product";

export default function WeeklyProductCard({ product }: { product: Product }) {
  const categorySlug = product.category.toLowerCase().replace(/\s+/g, "-") || "category";
  const imageSrc = product.image || cleanImageUrl(product.images?.[0]) || FALLBACK_IMG;
  const oldPrice = (product.price * 1.2).toFixed(2);
  const stockLeft = (product.id % 15) + 1;
  const { addToCart } = useCart();

  return (
    <article className="group flex h-full min-w-0 flex-col text-[#111]">
      <Link to={`/${categorySlug}/${product.id}`} className="flex min-h-0 flex-1 flex-col text-[#111]" aria-label={product.title}>
      <div className="mb-[11px] flex aspect-[1.08] w-full items-center justify-center overflow-hidden rounded-[18px] bg-[#faf9fa] p-[14px] group-hover:bg-[#f7f4f7] [@media(max-width:640px)]:rounded-[14px]">
        <img
          src={imageSrc}
          alt={product.title}
          loading="lazy"
          decoding="async"
          className="h-full w-full object-contain mix-blend-multiply"
          onError={(event) => {
            event.currentTarget.onerror = null;
            event.currentTarget.src = FALLBACK_IMG;
          }}
        />
      </div>
      <p className="mb-2 overflow-hidden text-ellipsis whitespace-nowrap text-[11px] font-medium leading-[1.25] text-[#111]">{product.title}</p>
      <p className="mb-[3px] text-[9px] leading-[1.2] text-[#111]">${Number(product.price).toFixed(2)}/lb</p>
      <div className="mb-[5px] flex items-baseline gap-[7px]">
        <strong className="text-[13px] font-extrabold text-[#111]">${Number(product.price).toFixed(2)}</strong>
        <span className="text-[9px] text-[#999] line-through">${oldPrice}</span>
      </div>
      <div className="flex gap-2 text-[9px] leading-[1.2] text-[#999]">
        <span className="text-[#b6349a]">{stockLeft} Left</span>
        <span>12 Left</span>
      </div>
      </Link>
      <button type="button" className="mt-3 w-full cursor-pointer rounded-[12px] bg-[#b6349a] px-4 py-[10px] text-[14px] font-semibold text-white transition-[background-color,transform] duration-200 hover:bg-[#de57c4] active:scale-[0.98]" onClick={() => addToCart(product)}>
        Add to Cart
      </button>
    </article>
  );
}
