import { useState, useEffect, useMemo } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Navigation, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import { fetchProducts } from "../services/api/productApi";
import ProductCard from "../components/product/ProductCard";
import type { FormEvent } from "react";
import type { Product } from "../types/product";

const promoBanners = [
  { img: "/img/Frame 33.png", alt: "Special Deals", link: "/category?deals=true" },
  { img: "/img/Frame 34.png", alt: "Festival Discount", link: "/category?price=0-50" },
  { img: "/img/Frame 35.png", alt: "New Collection", link: "/category?new=true" },
  { img: "/img/Rectangle 3.png", alt: "Super Sale", link: "/category" },
  { img: "/img/Frame 366.png", alt: "Trending Drinks", link: "/category" },
];

export default function Category() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchParams, setSearchParams] = useSearchParams();
  const [categorySearch, setCategorySearch] = useState("");
  const [minPriceInput, setMinPriceInput] = useState("");
  const [maxPriceInput, setMaxPriceInput] = useState("");
  const [sortBy, setSortBy] = useState("recommended");
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  // URL search params
  const catFilter = searchParams.get("cat") || "all";
  const priceFilter = searchParams.get("price") || "all";
  const dealsFilter = searchParams.get("deals") === "true";
  const newFilter = searchParams.get("new") === "true";
  const fastShippingFilter = searchParams.get("fast_shipping") === "true";
  const minRatingFilter = Number(searchParams.get("rating")) || 0;

  useEffect(() => {
    fetchProducts().then((data) => {
      setProducts(data);
      setLoading(false);
    });
  }, []);

  // Compute category list with counts
  const categoryStats = useMemo(() => {
    const stats: Record<string, number> = {};
    products.forEach((p) => {
      const name = p.category;
      if (name) {
        stats[name] = (stats[name] || 0) + 1;
      }
    });
    return Object.entries(stats).map(([name, count]) => ({ name, count }));
  }, [products]);

  const updateFilter = (key: string, value: string | boolean | number) => {
    const newParams = new URLSearchParams(searchParams);
    if (value === "all" || value === false || value === "" || value === 0) {
      newParams.delete(key);
    } else {
      newParams.set(key, String(value));
    }
    setSearchParams(newParams);
  };

  const handleCustomPriceSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const min = minPriceInput ? Number(minPriceInput) : 0;
    const max = maxPriceInput ? Number(maxPriceInput) : 100000;
    if (minPriceInput || maxPriceInput) {
      updateFilter("price", `${min}-${max}`);
    } else {
      updateFilter("price", "all");
    }
  };

  const resetFilters = () => {
    setMinPriceInput("");
    setMaxPriceInput("");
    setSearchParams(new URLSearchParams(catFilter && catFilter !== "all" ? `cat=${catFilter}` : ""));
  };

  // Filter products
  let filtered = [...products];

  // Category
  if (catFilter && catFilter !== "all") {
    filtered = filtered.filter((p) => {
      const name = p.category;
      const slug = name?.toLowerCase().replace(/\s+/g, "-");
      return (
        slug?.toLowerCase() === catFilter.toLowerCase() ||
        name?.toLowerCase() === catFilter.toLowerCase()
      );
    });
  }

  // Price
  if (priceFilter && priceFilter !== "all") {
    const [min, max] = priceFilter.split("-").map(Number);
    filtered = filtered.filter((p) => p.price >= min && p.price <= (max || Infinity));
  }

  // Deals
  if (dealsFilter) {
    filtered = filtered.filter((p) => p.price < 50);
  }

  // New arrivals
  if (newFilter) {
    filtered = filtered.filter((p) => p.id % 2 === 0);
  }

  // Fast shipping
  if (fastShippingFilter) {
    filtered = filtered.filter((p) => p.id % 3 !== 0);
  }

  // Rating
  if (minRatingFilter > 0) {
    filtered = filtered.filter((p) => {
      const rate = p.rating?.rate || (p.id % 5) + 1;
      return rate >= minRatingFilter;
    });
  }

  // Sorting
  if (sortBy === "price-asc") {
    filtered.sort((a, b) => a.price - b.price);
  } else if (sortBy === "price-desc") {
    filtered.sort((a, b) => b.price - a.price);
  } else if (sortBy === "name-asc") {
    filtered.sort((a, b) => (a.title || "").localeCompare(b.title || ""));
  }

  // Count active filters (excluding default category)
  const activeFiltersCount = [
    catFilter !== "all" && catFilter,
    priceFilter !== "all" && `$${priceFilter}`,
    dealsFilter && "Deals",
    newFilter && "New Arrivals",
    fastShippingFilter && "Fast Delivery",
    minRatingFilter > 0 && `${minRatingFilter}★ & up`,
  ].filter(Boolean).length;

  const filteredCategoryList = categoryStats.filter((c) =>
    c.name.toLowerCase().includes(categorySearch.toLowerCase())
  );

  return (
    <main className="min-h-screen bg-[#fafafa] px-6 py-8 max-[640px]:px-3 max-[640px]:py-4">
      <div className="mx-auto flex max-w-[1600px] gap-6 max-[1024px]:flex-col">
        
        {/* MOBILE FILTER TOGGLE BUTTON */}
        <div className="mb-4 hidden items-center justify-between gap-3 max-[1024px]:flex">
          <button 
            className="flex items-center gap-2 rounded-lg border border-[#e2e8f0] bg-white px-4 py-2.5 text-sm font-semibold text-[#334155] shadow-sm"
            onClick={() => setMobileFilterOpen(!mobileFilterOpen)}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M4 21v-7M4 10V3M12 21v-9M12 8V3M20 21v-5M20 12V3M1 14h6M9 8h6M17 16h6" />
            </svg>
            <span>Filters {activeFiltersCount > 0 && `(${activeFiltersCount})`}</span>
          </button>
          
          <div>
            <select className="rounded-lg border border-[#cbd5e1] bg-white px-3 py-2 text-sm" value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
              <option value="recommended">Recommended</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="name-asc">Product Name (A-Z)</option>
            </select>
          </div>
        </div>

        {/* LEFT SIDEBAR: TRENDYOL / HEPSIBURADA / AMAZON STYLE */}
        <aside className={`${mobileFilterOpen ? "block" : "max-[1024px]:hidden"} w-[290px] shrink-0 max-[1024px]:static max-[1024px]:w-full`}>
          <div className="rounded-2xl border border-[#e2e8f0] bg-white p-5 shadow-[0_2px_10px_rgba(15,23,42,0.04)]">
            
            {/* Sidebar Header */}
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#d73f98" strokeWidth="2.2">
                  <path d="M22 3H2l8 9.46V19l4 2v-8.54L22 3z" />
                </svg>
                <h3 className="font-bold text-[#0f172a]">Filters</h3>
                {activeFiltersCount > 0 && (
                  <span className="grid h-5 min-w-5 place-items-center rounded-full bg-[#d73f98] px-1 text-xs font-bold text-white">{activeFiltersCount}</span>
                )}
              </div>
              {activeFiltersCount > 0 && (
                <button className="text-xs font-semibold text-[#d73f98] hover:underline" onClick={resetFilters}>
                  Clear All
                </button>
              )}
            </div>

            {/* Active filter chips */}
            {activeFiltersCount > 0 && (
              <div className="mt-4 flex flex-wrap gap-2">
                {catFilter !== "all" && (
                  <span className="cursor-pointer rounded-full bg-[#fff0fa] px-2.5 py-1 text-xs text-[#b6349a]" onClick={() => updateFilter("cat", "all")}>
                    {catFilter} ✕
                  </span>
                )}
                {priceFilter !== "all" && (
                  <span className="cursor-pointer rounded-full bg-[#fff0fa] px-2.5 py-1 text-xs text-[#b6349a]" onClick={() => updateFilter("price", "all")}>
                    ${priceFilter} ✕
                  </span>
                )}
                {dealsFilter && (
                  <span className="cursor-pointer rounded-full bg-[#fff0fa] px-2.5 py-1 text-xs text-[#b6349a]" onClick={() => updateFilter("deals", false)}>
                    Deals ✕
                  </span>
                )}
                {newFilter && (
                  <span className="cursor-pointer rounded-full bg-[#fff0fa] px-2.5 py-1 text-xs text-[#b6349a]" onClick={() => updateFilter("new", false)}>
                    New Arrivals ✕
                  </span>
                )}
                {fastShippingFilter && (
                  <span className="cursor-pointer rounded-full bg-[#fff0fa] px-2.5 py-1 text-xs text-[#b6349a]" onClick={() => updateFilter("fast_shipping", false)}>
                    Fast Delivery ✕
                  </span>
                )}
                {minRatingFilter > 0 && (
                  <span className="cursor-pointer rounded-full bg-[#fff0fa] px-2.5 py-1 text-xs text-[#b6349a]" onClick={() => updateFilter("rating", 0)}>
                    {minRatingFilter}★+ ✕
                  </span>
                )}
              </div>
            )}

            {/* 1. CATEGORIES */}
            <div className="mt-6 border-t border-[#f1f5f9] pt-5">
              <div className="mb-3 font-semibold text-[#0f172a]">
                <span>Categories</span>
              </div>
              
              {categoryStats.length > 5 && (
                <div className="mb-3">
                  <input
                    type="text"
                    placeholder="Search category..."
                    value={categorySearch}
                    onChange={(e) => setCategorySearch(e.target.value)}
                  />
                </div>
              )}

              <div className="space-y-1">
                <label className={`flex cursor-pointer items-center gap-2 rounded-md px-2 py-2 text-sm transition hover:bg-[#f8fafc] ${catFilter === "all" ? "bg-[#fff5fc] text-[#d73f98]" : "text-[#475569]"}`}>
                  <input
                    type="radio"
                    name="category"
                    checked={catFilter === "all"}
                    onChange={() => updateFilter("cat", "all")}
                  />
                  <span className="h-4 w-4 rounded-full border border-[#cbd5e1]"></span>
                  <span className="flex-1">All Categories</span>
                  <span className="text-xs text-[#94a3b8]">({products.length})</span>
                </label>

                {filteredCategoryList.map((cat, i) => (
                  <label 
                    key={i} 
                    className={`flex cursor-pointer items-center gap-2 rounded-md px-2 py-2 text-sm transition hover:bg-[#f8fafc] ${catFilter.toLowerCase() === cat.name.toLowerCase() ? "bg-[#fff5fc] text-[#d73f98]" : "text-[#475569]"}`}
                  >
                    <input
                      type="radio"
                      name="category"
                      checked={catFilter.toLowerCase() === cat.name.toLowerCase()}
                      onChange={() => updateFilter("cat", cat.name)}
                    />
                    <span className="h-4 w-4 rounded-full border border-[#cbd5e1]"></span>
                    <span className="flex-1">{cat.name}</span>
                    <span className="text-xs text-[#94a3b8]">({cat.count})</span>
                  </label>
                ))}
              </div>
            </div>

            {/* 2. PRICE RANGE */}
            <div className="mt-6 border-t border-[#f1f5f9] pt-5">
              <div className="mb-3 font-semibold text-[#0f172a]">
                <span>Price Range</span>
              </div>

              {/* Quick price radios */}
              <div className="space-y-1">
                <label className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-2 text-sm text-[#475569] hover:bg-[#f8fafc]">
                  <input
                    type="radio"
                    name="price_quick"
                    checked={priceFilter === "all"}
                    onChange={() => updateFilter("price", "all")}
                  />
                  <span className="h-4 w-4 rounded-full border border-[#cbd5e1]"></span>
                  <span>All Prices</span>
                </label>
                <label className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-2 text-sm text-[#475569] hover:bg-[#f8fafc]">
                  <input
                    type="radio"
                    name="price_quick"
                    checked={priceFilter === "0-25"}
                    onChange={() => updateFilter("price", "0-25")}
                  />
                  <span className="h-4 w-4 rounded-full border border-[#cbd5e1]"></span>
                  <span>$0 - $25</span>
                </label>
                <label className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-2 text-sm text-[#475569] hover:bg-[#f8fafc]">
                  <input
                    type="radio"
                    name="price_quick"
                    checked={priceFilter === "25-50"}
                    onChange={() => updateFilter("price", "25-50")}
                  />
                  <span className="h-4 w-4 rounded-full border border-[#cbd5e1]"></span>
                  <span>$25 - $50</span>
                </label>
                <label className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-2 text-sm text-[#475569] hover:bg-[#f8fafc]">
                  <input
                    type="radio"
                    name="price_quick"
                    checked={priceFilter === "50-100"}
                    onChange={() => updateFilter("price", "50-100")}
                  />
                  <span className="h-4 w-4 rounded-full border border-[#cbd5e1]"></span>
                  <span>$50 - $100</span>
                </label>
                <label className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-2 text-sm text-[#475569] hover:bg-[#f8fafc]">
                  <input
                    type="radio"
                    name="price_quick"
                    checked={priceFilter === "100-10000"}
                    onChange={() => updateFilter("price", "100-10000")}
                  />
                  <span className="h-4 w-4 rounded-full border border-[#cbd5e1]"></span>
                  <span>$100 & Above</span>
                </label>
              </div>

              {/* Min - Max custom inputs */}
              <form onSubmit={handleCustomPriceSubmit} className="mt-3">
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    placeholder="Min"
                    value={minPriceInput}
                    onChange={(e) => setMinPriceInput(e.target.value)}
                  />
                  <span className="text-[#94a3b8]">-</span>
                  <input
                    type="number"
                    placeholder="Max"
                    value={maxPriceInput}
                    onChange={(e) => setMaxPriceInput(e.target.value)}
                  />
                  <button type="submit" className="grid h-9 w-9 place-items-center rounded-lg bg-[#d73f98] text-white hover:opacity-90" title="Apply Filter">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                      <path d="M5 12h14M12 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
              </form>
            </div>

            {/* 3. DEALS & PERKS */}
            <div className="mt-6 border-t border-[#f1f5f9] pt-5">
              <div className="mb-3 font-semibold text-[#0f172a]">
                <span>Deals & Perks</span>
              </div>
              <div className="space-y-3">
                <label className="flex cursor-pointer items-center justify-between gap-2">
                  <div className="flex flex-col">
                    <span className="text-sm font-semibold text-[#0f172a]">Discounted Products</span>
                    <span className="text-[11px] text-[#64748b]">Special promotions</span>
                  </div>
                  <input
                    type="checkbox"
                    className="peer sr-only"
                    checked={dealsFilter}
                    onChange={(e) => updateFilter("deals", e.target.checked)}
                  />
                  <span className="relative h-5 w-9 rounded-full bg-[#cbd5e1] transition peer-checked:bg-[#d73f98] before:absolute before:left-0.5 before:top-0.5 before:h-4 before:w-4 before:rounded-full before:bg-white before:transition-transform peer-checked:before:translate-x-4"></span>
                </label>

                <label className="flex cursor-pointer items-center justify-between gap-2">
                  <div className="flex flex-col">
                    <span className="text-sm font-semibold text-[#0f172a]">New Arrivals</span>
                    <span className="text-[11px] text-[#64748b]">Recently added</span>
                  </div>
                  <input
                    type="checkbox"
                    className="peer sr-only"
                    checked={newFilter}
                    onChange={(e) => updateFilter("new", e.target.checked)}
                  />
                  <span className="relative h-5 w-9 rounded-full bg-[#cbd5e1] transition peer-checked:bg-[#d73f98] before:absolute before:left-0.5 before:top-0.5 before:h-4 before:w-4 before:rounded-full before:bg-white before:transition-transform peer-checked:before:translate-x-4"></span>
                </label>

                <label className="flex cursor-pointer items-center justify-between gap-2">
                  <div className="flex flex-col">
                    <span className="text-sm font-semibold text-[#0f172a]">Fast Delivery</span>
                    <span className="text-[11px] text-[#64748b]">Ships today</span>
                  </div>
                  <input
                    type="checkbox"
                    className="peer sr-only"
                    checked={fastShippingFilter}
                    onChange={(e) => updateFilter("fast_shipping", e.target.checked)}
                  />
                  <span className="relative h-5 w-9 rounded-full bg-[#cbd5e1] transition peer-checked:bg-[#d73f98] before:absolute before:left-0.5 before:top-0.5 before:h-4 before:w-4 before:rounded-full before:bg-white before:transition-transform peer-checked:before:translate-x-4"></span>
                </label>
              </div>
            </div>

            {/* 4. CUSTOMER RATING */}
            <div className="mt-6 border-t border-[#f1f5f9] pt-5">
              <div className="mb-3 font-semibold text-[#0f172a]">
                <span>Customer Rating</span>
              </div>
              <div className="space-y-1">
                {[4, 3, 2].map((stars) => (
                  <label key={stars} className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 hover:bg-[#f8fafc]">
                    <input
                      type="radio"
                      name="rating"
                      checked={minRatingFilter === stars}
                      onChange={() => updateFilter("rating", minRatingFilter === stars ? 0 : stars)}
                    />
                    <span className="h-4 w-4 rounded-full border border-[#cbd5e1]"></span>
                    <div className="text-[15px] tracking-[1px] text-amber-500">
                      {"★".repeat(stars)}{"☆".repeat(5 - stars)}
                    </div>
                    <span className="text-xs font-medium text-[#64748b]">& up</span>
                  </label>
                ))}
              </div>
            </div>

          </div>
        </aside>

        {/* RIGHT MAIN CONTENT */}
        <section className="min-w-0 flex-1">
          
          {/* Top category nav pills */}
          <div className="mb-5 flex gap-2.5 overflow-x-auto pb-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <Link
              to="/category"
              className={`inline-flex shrink-0 items-center whitespace-nowrap rounded-[30px] border px-[18px] py-2 text-[13.5px] font-semibold transition-all ${!catFilter || catFilter === "all" ? "border-[#d73f98] bg-[#d73f98] text-white shadow-[0_4px_12px_rgba(215,63,152,0.25)]" : "border-[#e2e8f0] bg-white text-[#334155] hover:border-[#d73f98] hover:text-[#d73f98]"}`}
            >
              All ({products.length})
            </Link>
            {categoryStats.map((cat, i) => (
              <Link
                key={i}
                to={`/category?cat=${encodeURIComponent(cat.name)}`}
                className={`inline-flex shrink-0 items-center whitespace-nowrap rounded-[30px] border px-[18px] py-2 text-[13.5px] font-semibold transition-all ${catFilter.toLowerCase() === cat.name.toLowerCase() ? "border-[#d73f98] bg-[#d73f98] text-white shadow-[0_4px_12px_rgba(215,63,152,0.25)]" : "border-[#e2e8f0] bg-white text-[#334155] hover:border-[#d73f98] hover:text-[#d73f98]"}`}
              >
                {cat.name} ({cat.count})
              </Link>
            ))}
          </div>

          {/* Top Promo Banners Swiper */}
          <div className="relative mb-7 w-full">
            <Swiper
              modules={[Autoplay, Navigation, Pagination]}
              autoplay={{
                delay: 3500,
                disableOnInteraction: false,
                pauseOnMouseEnter: true,
              }}
              loop={true}
              slidesPerView="auto"
              spaceBetween={20}
              speed={600}
              grabCursor={true}
              navigation={true}
              pagination={{ clickable: true }}
              className="w-full !pb-[34px]"
            >
              {promoBanners.map((banner, i) => (
                <SwiperSlide key={i} className="w-auto!">
                  <Link to={banner.link} className="inline-flex h-[220px] w-auto shrink-0 overflow-hidden rounded-[18px] bg-[#f1f5f9] shadow-[0_3px_12px_rgba(0,0,0,0.06)] transition hover:-translate-y-[3px] hover:shadow-[0_8px_22px_rgba(215,63,152,0.18)]">
                    <img className="block h-full w-auto max-w-none rounded-[18px] object-contain" src={banner.img} alt={banner.alt} />
                  </Link>
                </SwiperSlide>
              ))}
            </Swiper>
          </div>

          {/* Results Toolbar / Sort */}
          <div className="mb-6 flex items-center justify-between rounded-[14px] border border-[#e2e8f0] bg-white px-5 py-3.5 shadow-[0_1px_4px_rgba(15,23,42,0.03)]">
            <div className="flex items-baseline gap-2.5">
              <h2 className="m-0 text-xl font-extrabold capitalize text-[#0f172a]">{catFilter && catFilter !== "all" ? catFilter : "All Products"}</h2>
              <span className="text-[13.5px] text-[#64748b]">
                (<strong className="text-[#0f172a]">{filtered.length}</strong> products found)
              </span>
            </div>

            <div className="flex items-center gap-2.5 max-[1024px]:hidden">
              <span className="text-[13.5px] font-semibold text-[#475569]">Sort by:</span>
              <select 
                value={sortBy} 
                onChange={(e) => setSortBy(e.target.value)}
                className="cursor-pointer rounded-lg border border-[#cbd5e1] bg-[#f8fafc] px-3.5 py-2 text-[13px] font-semibold text-[#0f172a] outline-none focus:border-[#d73f98]"
              >
                <option value="recommended">Recommended</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="name-asc">Product Name (A-Z)</option>
              </select>
            </div>
          </div>

          {/* Product Grid */}
          {loading ? (
            <div className="rounded-2xl border border-[#e2e8f0] bg-white px-5 py-[60px] text-center shadow-[0_1px_4px_rgba(0,0,0,0.03)]">
              <div className="mx-auto mb-4 h-9 w-9 animate-spin rounded-full border-[3.5px] border-[#f3f4f6] border-t-[#d73f98]"></div>
              <p>Loading products...</p>
            </div>
          ) : filtered.length > 0 ? (
            <div className="grid w-full grid-cols-[repeat(auto-fill,minmax(230px,1fr))] gap-5 max-[640px]:grid-cols-[repeat(auto-fill,minmax(160px,1fr))] max-[640px]:gap-3" id="category-Conteiner">
              {filtered.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-[#e2e8f0] bg-white px-5 py-[60px] text-center shadow-[0_1px_4px_rgba(0,0,0,0.03)]">
              <div className="mb-4 text-5xl">🔍</div>
              <h3 className="mb-2 text-lg font-extrabold text-[#0f172a]">No products found matching your criteria</h3>
              <p className="mb-5 text-sm text-[#64748b]">Try clearing or modifying your filters.</p>
              <button className="rounded-[30px] bg-[#d73f98] px-6 py-2.5 text-sm font-bold text-white transition hover:opacity-90" onClick={resetFilters}>
                Clear Filters
              </button>
            </div>
          )}

        </section>
      </div>
    </main>
  );
}
