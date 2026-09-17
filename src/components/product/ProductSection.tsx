import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import { Link } from "react-router-dom";
import ProductCard from "./ProductCard";
import WeeklyProductCard from "./WeeklyProductCard";
import type { Product } from "../../types/product";

interface ProductSectionProps {
  title?: string;
  products: Product[];
  viewAllHref?: string;
  showFilters?: boolean;
  filterOptions?: string[];
  selectedFilter?: string;
  onFilterChange?: (filter: string) => void;
  variant?: "default" | "weekly";
  sectionKey: string;
  embedded?: boolean;
  className?: string;
}

export default function ProductSection({
  title,
  products,
  viewAllHref,
  showFilters = false,
  filterOptions = [],
  selectedFilter = "",
  onFilterChange,
  variant = "default",
  sectionKey,
  embedded = false,
  className = "",
}: ProductSectionProps) {
  const previousButton = `${sectionKey}-previous`;
  const nextButton = `${sectionKey}-next`;
  const ProductCardComponent = variant === "weekly" ? WeeklyProductCard : ProductCard;

  const carousel = products.length > 0 ? (
    <Swiper
      modules={variant === "weekly" ? [] : [Navigation]}
      navigation={variant === "weekly" ? undefined : { nextEl: `.${nextButton}`, prevEl: `.${previousButton}` }}
      slidesPerView={2}
      spaceBetween={20}
      breakpoints={{
        540: { slidesPerView: 3 },
        768: { slidesPerView: 4 },
        1024: { slidesPerView: 5 },
      }}
      className="w-full"
    >
      {products.map((product) => (
        <SwiperSlide key={product.id}>
          <ProductCardComponent product={product} />
        </SwiperSlide>
      ))}
    </Swiper>
  ) : (
    <p className="py-8 text-center text-sm text-[#888]">Bu bölümde henüz ürün bulunmuyor.</p>
  );

  if (embedded) return carousel;

  return (
    <section className={`mb-[60px] rounded-[24px] px-6 py-7 [@media(max-width:768px)]:px-4 [@media(max-width:640px)]:rounded-[18px] [@media(max-width:640px)]:py-5 ${className}`}>
      <div className="mb-6 flex items-center justify-between [@media(max-width:768px)]:flex-col [@media(max-width:768px)]:items-start [@media(max-width:768px)]:gap-3">
        {title && <h2 className="m-0 text-[24px] font-bold tracking-normal text-[#111] [@media(max-width:640px)]:text-[20px]">{title}</h2>}
        <div className="flex items-center gap-[14px]">
          {viewAllHref && <Link to={viewAllHref} className="inline-flex items-center rounded-[30px] border border-[#b6349a] bg-white px-4 py-2 text-[13px] font-semibold text-[#b6349a] transition-colors duration-200 hover:bg-[#b6349a] hover:text-white">View All →</Link>}
          {variant !== "weekly" && <div className="flex gap-3"><button type="button" className={`${previousButton} flex size-10 cursor-pointer items-center justify-center rounded-full border border-[#eee] bg-white text-[20px] text-[#555] transition-all duration-200 hover:border-[#b6349a] hover:bg-[#fdf5fb] hover:text-[#b6349a]`} aria-label={`Previous ${title || "products"}`}>‹</button><button type="button" className={`${nextButton} flex size-10 cursor-pointer items-center justify-center rounded-full border border-[#eee] bg-white text-[20px] text-[#555] transition-all duration-200 hover:border-[#b6349a] hover:bg-[#fdf5fb] hover:text-[#b6349a]`} aria-label={`Next ${title || "products"}`}>›</button></div>}
        </div>
      </div>

      {showFilters && filterOptions.length > 0 && (
        <div className="mb-6 flex flex-wrap gap-[10px]">
          {filterOptions.map((filter) => (
            <button key={filter} type="button" onClick={() => onFilterChange?.(selectedFilter === filter ? "" : filter)} className={`cursor-pointer rounded-[30px] border px-[18px] py-[7px] text-[13px] font-medium transition-all duration-200 hover:border-[#b6349a] ${selectedFilter === filter ? "border-[#b6349a] bg-[#fdf5fd] text-[#b6349a]" : "border-[#e0e0e0] bg-white text-[#555]"}`}>
              {filter}
            </button>
          ))}
        </div>
      )}

      {carousel}
    </section>
  );
}
