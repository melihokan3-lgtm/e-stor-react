import { Link } from "react-router-dom";
import ProductCard from "../product/ProductCard";
import type { Product } from "../../types/product";

interface HomePromoSectionProps {
  products: Product[];
  categories: string[];
  variant: "categories" | "stats";
}

export default function HomePromoSection({ products, categories, variant }: HomePromoSectionProps) {
  const isStats = variant === "stats";

  return (
    <section className={`mb-[60px] rounded-[24px] p-10 [@media(max-width:768px)]:p-6 [@media(max-width:480px)]:p-4 ${isStats ? "bg-[#fdf5f8]" : "bg-[#fef9fc]"}`}>
      <div className="flex items-center gap-10 [@media(max-width:1024px)]:flex-col-reverse">
        <div className="grid min-w-0 flex-[2] grid-cols-3 gap-5 [@media(max-width:1024px)]:w-full [@media(max-width:768px)]:grid-cols-2 [@media(max-width:480px)]:grid-cols-1!">
          {products.map((product) => (
            <div key={product.id} className={`flex h-full min-w-0 flex-col ${isStats ? "rounded-[20px] bg-white p-[14px] shadow-[0_6px_20px_rgba(0,0,0,0.04)] transition-transform duration-200 hover:-translate-y-1 [&_.card-img-wrapper]:bg-[#faf8fa]" : ""}`}>
              <ProductCard product={product} />
            </div>
          ))}
        </div>
        <div className="min-w-0 flex-1 [@media(max-width:1024px)]:w-full">
          <p className="mb-[10px] text-[14px] font-bold text-[#b6349a]">Get 10% OFF On Your First Order</p>
          <h2 className="mb-6 text-[34px] font-extrabold leading-[1.2] text-[#111] [@media(max-width:480px)]:text-[26px]">Order Now Your Grocery!</h2>
          {isStats ? (
            <>
              <div className="mb-7 flex gap-7">
                <div><h4 className="mb-1 text-[26px] font-extrabold text-[#111]">1k+</h4><p className="text-[12px] font-medium text-[#777]">Items</p></div>
                <div><h4 className="mb-1 text-[26px] font-extrabold text-[#111]">20</h4><p className="text-[12px] font-medium text-[#777]">Minutes</p></div>
                <div><h4 className="mb-1 text-[26px] font-extrabold text-[#111]">30%</h4><p className="text-[12px] font-medium text-[#777]">Up to off firm</p></div>
              </div>
              <button type="button" className="cursor-pointer rounded-[30px] bg-[#b6349a] px-[34px] py-[14px] text-[15px] font-bold text-white transition-colors duration-200 hover:bg-[#92277a]">Order Now →</button>
            </>
          ) : (
            <div className="flex flex-wrap gap-[10px]">
              {categories.map((category) => <Link key={category} to={`/category?cat=${encodeURIComponent(category)}`} className="rounded-[30px] border border-[#e0e0e0] bg-white px-4 py-[7px] text-[13px] font-medium text-[#444] transition-colors duration-200 hover:border-[#b6349a] hover:text-[#b6349a]">{category}</Link>)}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
