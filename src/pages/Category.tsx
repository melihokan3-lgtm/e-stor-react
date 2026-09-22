import { useState, useEffect, useMemo, useRef } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay } from "swiper/modules";
import { ProductCard } from "../components/product";
import type { FormEvent } from "react";
import useProducts from "../features/products/useProducts";
import SeoMeta from "../components/common/SeoMeta";

const promoBanners = [
  { img: "/img/optimized/Frame 33.webp", alt: "Special Deals", link: "/category?deals=true" },
  { img: "/img/optimized/Frame 34.webp", alt: "Festival Discount", link: "/category?price=0-50" },
  { img: "/img/optimized/Frame 35.webp", alt: "New Collection", link: "/category?new=true" },
  { img: "/img/optimized/Rectangle 3.webp", alt: "Super Sale", link: "/category" },
  { img: "/img/optimized/Frame 366.webp", alt: "Trending Drinks", link: "/category" },
];

const sortOptions = [
  { value: "recommended", label: "Recommended" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
  { value: "name-asc", label: "Product Name (A-Z)" },
];

const normalizeCategory = (value: string | undefined): string =>
  (value || "").trim().toLocaleLowerCase("tr-TR").replace(/[·/]/g, " ").replace(/\s+/g, " ");

const categoryMatches = (productCategory: string | undefined, selectedCategory: string): boolean => {
  const product = normalizeCategory(productCategory);
  const selected = normalizeCategory(selectedCategory);
  if (!selected || selected === "all") return true;
  if (product === selected) return true;
  const productSlug = product.replace(/\s+/g, "-");
  const selectedSlug = selected.replace(/\s+/g, "-");
  if (productSlug === selectedSlug) return true;
  // Also support display categories such as "Featured · Eggs" when the URL contains "Eggs".
  return product.split(" ").at(-1) === selected || product.endsWith(` ${selected}`);
};

function SortSelect({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const selectedOption = sortOptions.find((option) => option.value === value) ?? sortOptions[0];

  useEffect(() => {
    if (!open) return undefined;

    const handlePointerDown = (event: PointerEvent): void => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    const handleKeyDown = (event: KeyboardEvent): void => {
      if (event.key === "Escape") setOpen(false);
    };

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  return (
    <div ref={containerRef} className="relative min-w-[170px] max-[480px]:min-w-0 max-[480px]:flex-1">
      <button
        type="button"
        aria-label="Ürünleri sırala"
        aria-haspopup="listbox"
        aria-expanded={open}
        className="flex w-full items-center justify-between gap-3 rounded-[10px] border border-[#e7dfe7] bg-white px-3.5 py-2 text-left text-[13px] font-semibold text-[#333] shadow-[0_2px_8px_rgba(182,52,154,0.06)] outline-none transition hover:border-[#b6349a] focus:border-[#b6349a] focus:ring-2 focus:ring-[#b6349a]/15"
        onClick={() => setOpen((isOpen) => !isOpen)}
      >
        <span className="truncate">{selectedOption.label}</span>
        <svg className={`size-4 shrink-0 text-[#b6349a] transition-transform ${open ? "rotate-180" : ""}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>
      {open && (
        <div className="absolute right-0 top-full z-50 mt-2 w-full min-w-[210px] overflow-hidden rounded-[12px] border border-[#f0e1ed] bg-white p-1.5 shadow-[0_12px_28px_rgba(62,24,54,0.14)]" role="listbox" aria-label="Sıralama seçenekleri">
          {sortOptions.map((option) => (
            <button
              key={option.value}
              type="button"
              role="option"
              aria-selected={option.value === value}
              className={`flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-left text-[13px] transition ${option.value === value ? "bg-[#fff0fa] font-bold text-[#b6349a]" : "font-medium text-[#444] hover:bg-[#fff7fc] hover:text-[#b6349a]"}`}
              onClick={() => {
                onChange(option.value);
                setOpen(false);
              }}
            >
              {option.label}
              {option.value === value && <span aria-hidden="true">✓</span>}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default function Category() {
  const { products, loading, error } = useProducts();
  const [searchParams, setSearchParams] = useSearchParams();
  // Keep filtering responsive even while the router is updating the URL.
  const [activeFilterParams, setActiveFilterParams] = useState(() => new URLSearchParams(searchParams));
  const [categorySearch, setCategorySearch] = useState("");
  const [minPriceInput, setMinPriceInput] = useState("");
  const [maxPriceInput, setMaxPriceInput] = useState("");
  const [sortBy, setSortBy] = useState("recommended");
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  // URL search params
  useEffect(() => {
    setActiveFilterParams(new URLSearchParams(searchParams));
  }, [searchParams]);

  const catFilter = activeFilterParams.get("cat") || "all";
  const priceFilter = activeFilterParams.get("price") || "all";
  const dealsFilter = activeFilterParams.get("deals") === "true";
  const newFilter = activeFilterParams.get("new") === "true";
  const fastShippingFilter = activeFilterParams.get("fast_shipping") === "true";
  const minRatingFilter = Number(activeFilterParams.get("rating")) || 0;
  const categoryLabel = catFilter === "all"
    ? "Tüm Ürünler"
    : catFilter.split("-").map((word) => word.charAt(0).toUpperCase() + word.slice(1)).join(" ");
  const categoryCanonical = catFilter === "all" ? "/category" : `/category?cat=${encodeURIComponent(catFilter)}`;

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
    setActiveFilterParams((currentParams) => {
      const newParams = new URLSearchParams(currentParams);
      if (value === "all" || value === false || value === "" || value === 0) newParams.delete(key);
      else newParams.set(key, String(value));
      setSearchParams(newParams);
      return newParams;
    });
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
  const filtered = useMemo(() => {
    let result = products.filter((product) => categoryMatches(product.category, catFilter));
    if (priceFilter && priceFilter !== "all") {
      const [min, max] = priceFilter.split("-").map(Number);
      result = result.filter((product) => product.price >= min && product.price <= (max || Infinity));
    }
    if (dealsFilter) result = result.filter((product) => product.price < 50);
    if (newFilter) result = result.filter((product) => product.id % 2 === 0);
    if (fastShippingFilter) result = result.filter((product) => product.id % 3 !== 0);
    if (minRatingFilter > 0) {
      result = result.filter((product) => (product.rating?.rate || (product.id % 5) + 1) >= minRatingFilter);
    }
    return [...result].sort((a, b) => {
      if (sortBy === "price-asc") return a.price - b.price;
      if (sortBy === "price-desc") return b.price - a.price;
      if (sortBy === "name-asc") return (a.title || "").localeCompare(b.title || "");
      return 0;
    });
  }, [products, catFilter, priceFilter, dealsFilter, newFilter, fastShippingFilter, minRatingFilter, sortBy]);

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
      <SeoMeta
        title={`${categoryLabel} | E-Storee`}
        description={`${categoryLabel} ürünlerini E-Storee'de keşfedin. Güncel fiyatları karşılaştırın ve online sipariş verin.`}
        canonicalPath={categoryCanonical}
      />
      <div className="mx-auto flex max-w-[1600px] gap-6 max-[1024px]:flex-col">
        
        {/* MOBILE FILTER TOGGLE BUTTON */}
        <div className="mb-4 hidden items-center justify-between gap-3 max-[1024px]:flex">
          <button
            type="button"
            aria-expanded={mobileFilterOpen}
            aria-controls="category-filters"
            className="flex items-center gap-2 rounded-lg border border-[#e2e8f0] bg-white px-4 py-2.5 text-sm font-semibold text-[#334155] shadow-sm"
            onClick={() => setMobileFilterOpen(!mobileFilterOpen)}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M4 21v-7M4 10V3M12 21v-9M12 8V3M20 21v-5M20 12V3M1 14h6M9 8h6M17 16h6" />
            </svg>
            <span>Filters {activeFiltersCount > 0 && `(${activeFiltersCount})`}</span>
          </button>
          
          <div>
            <SortSelect value={sortBy} onChange={setSortBy} />
          </div>
        </div>

        {/* LEFT SIDEBAR: TRENDYOL / HEPSIBURADA / AMAZON STYLE */}
        <aside id="category-filters" className={`${mobileFilterOpen ? "block" : "max-[1024px]:hidden"} w-[290px] shrink-0 max-[1024px]:static max-[1024px]:w-full`}>
          <div className="rounded-2xl border border-[#e2e8f0] bg-white p-5 shadow-[0_2px_10px_rgba(15,23,42,0.04)]">
            
            {/* Sidebar Header */}
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#d73f98" strokeWidth="2.2">
                  <path d="M22 3H2l8 9.46V19l4 2v-8.54L22 3z" />
                </svg>
                <h2 className="font-bold text-[#0f172a]">Filters</h2>
                {activeFiltersCount > 0 && (
                  <span className="grid h-5 min-w-5 place-items-center rounded-full bg-[#d73f98] px-1 text-xs font-bold text-white">{activeFiltersCount}</span>
                )}
              </div>
              <div className="flex items-center gap-3">
                {activeFiltersCount > 0 && (
                  <button type="button" className="text-xs font-semibold text-[#d73f98] hover:underline" onClick={resetFilters}>
                    Clear All
                  </button>
                )}
                <button
                  type="button"
                  className="hidden items-center gap-1 rounded-lg border border-[#e2e8f0] px-2.5 py-1.5 text-xs font-semibold text-[#475569] hover:border-[#d73f98] hover:text-[#d73f98] max-[1024px]:inline-flex"
                  onClick={() => setMobileFilterOpen(false)}
                  aria-label="Filtreleri kapat"
                >
                  <span aria-hidden="true">×</span>
                  Close
                </button>
              </div>
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
                    aria-label="Kategori ara"
                    placeholder="Search category..."
                    className="w-full rounded-lg border border-[#e2e8f0] bg-[#f8fafc] px-3 py-2 text-xs text-[#0f172a] outline-none transition focus:border-[#d73f98] focus:bg-white"
                    value={categorySearch}
                    onChange={(e) => setCategorySearch(e.target.value)}
                  />
                </div>
              )}

              <div className="space-y-1">
                <label className={`flex cursor-pointer items-center gap-2 rounded-md px-2 py-2 text-sm transition hover:bg-[#f8fafc] ${catFilter === "all" ? "bg-[#fff5fc] text-[#d73f98]" : "text-[#475569]"}`}>
                  <input
                    type="radio"
                    className="peer sr-only"
                    name="category"
                    checked={catFilter === "all"}
                    onChange={() => updateFilter("cat", "all")}
                  />
                  <span className="relative h-4 w-4 shrink-0 rounded-full border border-[#cbd5e1] transition peer-checked:border-[#d73f98] peer-checked:bg-[#d73f98] after:absolute after:left-1/2 after:top-1/2 after:size-1.5 after:-translate-x-1/2 after:-translate-y-1/2 after:rounded-full after:bg-white after:opacity-0 peer-checked:after:opacity-100"></span>
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
                      className="peer sr-only"
                      name="category"
                      checked={catFilter.toLowerCase() === cat.name.toLowerCase()}
                      onChange={() => updateFilter("cat", cat.name)}
                    />
                    <span className="relative h-4 w-4 shrink-0 rounded-full border border-[#cbd5e1] transition peer-checked:border-[#d73f98] peer-checked:bg-[#d73f98] after:absolute after:left-1/2 after:top-1/2 after:size-1.5 after:-translate-x-1/2 after:-translate-y-1/2 after:rounded-full after:bg-white after:opacity-0 peer-checked:after:opacity-100"></span>
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
                    className="peer sr-only"
                    name="price_quick"
                    checked={priceFilter === "all"}
                    onChange={() => updateFilter("price", "all")}
                  />
                  <span className="relative h-4 w-4 shrink-0 rounded-full border border-[#cbd5e1] transition peer-checked:border-[#d73f98] peer-checked:bg-[#d73f98] after:absolute after:left-1/2 after:top-1/2 after:size-1.5 after:-translate-x-1/2 after:-translate-y-1/2 after:rounded-full after:bg-white after:opacity-0 peer-checked:after:opacity-100"></span>
                  <span>All Prices</span>
                </label>
                <label className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-2 text-sm text-[#475569] hover:bg-[#f8fafc]">
                  <input
                    type="radio"
                    className="peer sr-only"
                    name="price_quick"
                    checked={priceFilter === "0-25"}
                    onChange={() => updateFilter("price", "0-25")}
                  />
                  <span className="relative h-4 w-4 shrink-0 rounded-full border border-[#cbd5e1] transition peer-checked:border-[#d73f98] peer-checked:bg-[#d73f98] after:absolute after:left-1/2 after:top-1/2 after:size-1.5 after:-translate-x-1/2 after:-translate-y-1/2 after:rounded-full after:bg-white after:opacity-0 peer-checked:after:opacity-100"></span>
                  <span>$0 - $25</span>
                </label>
                <label className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-2 text-sm text-[#475569] hover:bg-[#f8fafc]">
                  <input
                    type="radio"
                    className="peer sr-only"
                    name="price_quick"
                    checked={priceFilter === "25-50"}
                    onChange={() => updateFilter("price", "25-50")}
                  />
                  <span className="relative h-4 w-4 shrink-0 rounded-full border border-[#cbd5e1] transition peer-checked:border-[#d73f98] peer-checked:bg-[#d73f98] after:absolute after:left-1/2 after:top-1/2 after:size-1.5 after:-translate-x-1/2 after:-translate-y-1/2 after:rounded-full after:bg-white after:opacity-0 peer-checked:after:opacity-100"></span>
                  <span>$25 - $50</span>
                </label>
                <label className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-2 text-sm text-[#475569] hover:bg-[#f8fafc]">
                  <input
                    type="radio"
                    className="peer sr-only"
                    name="price_quick"
                    checked={priceFilter === "50-100"}
                    onChange={() => updateFilter("price", "50-100")}
                  />
                  <span className="relative h-4 w-4 shrink-0 rounded-full border border-[#cbd5e1] transition peer-checked:border-[#d73f98] peer-checked:bg-[#d73f98] after:absolute after:left-1/2 after:top-1/2 after:size-1.5 after:-translate-x-1/2 after:-translate-y-1/2 after:rounded-full after:bg-white after:opacity-0 peer-checked:after:opacity-100"></span>
                  <span>$50 - $100</span>
                </label>
                <label className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-2 text-sm text-[#475569] hover:bg-[#f8fafc]">
                  <input
                    type="radio"
                    name="price_quick"
                    className="peer sr-only"
                    checked={priceFilter === "100-10000"}
                    onChange={() => updateFilter("price", "100-10000")}
                  />
                  <span className="relative h-4 w-4 shrink-0 rounded-full border border-[#cbd5e1] transition peer-checked:border-[#d73f98] peer-checked:bg-[#d73f98] after:absolute after:left-1/2 after:top-1/2 after:size-1.5 after:-translate-x-1/2 after:-translate-y-1/2 after:rounded-full after:bg-white after:opacity-0 peer-checked:after:opacity-100"></span>
                  <span>$100 & Above</span>
                </label>
              </div>

              {/* Min - Max custom inputs */}
              <form onSubmit={handleCustomPriceSubmit} className="mt-4 rounded-xl border border-[#edf0f4] bg-[#fafbfc] p-3">
                <div className="mb-2 text-[11px] font-semibold uppercase tracking-[0.04em] text-[#94a3b8]">Custom price</div>
                <div className="flex items-end gap-2">
                  <label className="min-w-0 flex-1">
                    <span className="mb-1 block text-[11px] font-medium text-[#64748b]">Minimum</span>
                    <span className="flex items-center rounded-lg border border-[#e2e8f0] bg-white px-2.5 transition focus-within:border-[#d73f98] focus-within:ring-2 focus-within:ring-[#d73f98]/10">
                      <span className="text-xs text-[#94a3b8]">$</span>
                      <input
                        type="text"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        placeholder="0"
                        value={minPriceInput}
                        onChange={(e) => setMinPriceInput(e.target.value)}
                        className="min-w-0 w-full border-0 bg-transparent px-1.5 py-2 text-sm text-[#0f172a] outline-none"
                      />
                    </span>
                  </label>
                  <span className="mb-2 text-xs font-semibold text-[#94a3b8]">to</span>
                  <label className="min-w-0 flex-1">
                    <span className="mb-1 block text-[11px] font-medium text-[#64748b]">Maximum</span>
                    <span className="flex items-center rounded-lg border border-[#e2e8f0] bg-white px-2.5 transition focus-within:border-[#d73f98] focus-within:ring-2 focus-within:ring-[#d73f98]/10">
                      <span className="text-xs text-[#94a3b8]">$</span>
                      <input
                        type="text"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        placeholder="Any"
                        value={maxPriceInput}
                        onChange={(e) => setMaxPriceInput(e.target.value)}
                        className="min-w-0 w-full border-0 bg-transparent px-1.5 py-2 text-sm text-[#0f172a] outline-none"
                      />
                    </span>
                  </label>
                  <button type="submit" className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-[#d73f98] text-white shadow-[0_4px_10px_rgba(215,63,152,0.2)] transition hover:bg-[#b6349a] focus:outline-none focus:ring-2 focus:ring-[#d73f98]/30" title="Apply Filter" aria-label="Apply price filter">
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
                      className="peer sr-only"
                      name="rating"
                      checked={minRatingFilter === stars}
                      onChange={() => updateFilter("rating", minRatingFilter === stars ? 0 : stars)}
                    />
                    <span className="relative h-4 w-4 shrink-0 rounded-full border border-[#cbd5e1] transition peer-checked:border-[#d73f98] peer-checked:bg-[#d73f98] after:absolute after:left-1/2 after:top-1/2 after:size-1.5 after:-translate-x-1/2 after:-translate-y-1/2 after:rounded-full after:bg-white after:opacity-0 peer-checked:after:opacity-100"></span>
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
              modules={[Autoplay]}
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
              className="w-full"
            >
              {promoBanners.map((banner, i) => (
                <SwiperSlide key={i} className="w-auto!">
                  <Link to={banner.link} className="inline-flex h-[220px] w-auto shrink-0 overflow-hidden rounded-[18px] bg-[#f1f5f9] shadow-[0_3px_12px_rgba(0,0,0,0.06)] transition hover:-translate-y-[3px] hover:shadow-[0_8px_22px_rgba(215,63,152,0.18)]">
                    <img className="block h-full w-auto max-w-none rounded-[18px] object-contain" src={banner.img} alt={banner.alt} width={banner.img.includes("Frame 33") ? 568 : banner.img.includes("Frame 34") ? 276 : banner.img.includes("Frame 35") ? 853 : banner.img.includes("Frame 366") ? 258 : 422} height={248} loading="lazy" decoding="async" />
                  </Link>
                </SwiperSlide>
              ))}
            </Swiper>
          </div>

          {/* Results Toolbar / Sort */}
          <div className="mb-6 flex items-center justify-between rounded-[14px] border border-[#e2e8f0] bg-white px-5 py-3.5 shadow-[0_1px_4px_rgba(15,23,42,0.03)]">
            <div className="flex items-baseline gap-2.5">
              <h1 className="m-0 text-xl font-extrabold capitalize text-[#0f172a]">{categoryLabel}</h1>
              <span className="text-[13.5px] text-[#64748b]">
                (<strong className="text-[#0f172a]">{filtered.length}</strong> products found)
              </span>
            </div>

            <div className="flex items-center gap-2.5 max-[1024px]:hidden">
              <span className="text-[13.5px] font-semibold text-[#475569]">Sort by:</span>
              <SortSelect value={sortBy} onChange={setSortBy} />
            </div>
          </div>

          {/* Product Grid */}
          {loading ? (
            <div className="rounded-2xl border border-[#e2e8f0] bg-white px-5 py-[60px] text-center shadow-[0_1px_4px_rgba(0,0,0,0.03)]">
              <div className="mx-auto mb-4 h-9 w-9 animate-spin rounded-full border-[3.5px] border-[#f3f4f6] border-t-[#d73f98]"></div>
              <p>Loading products...</p>
            </div>
          ) : error ? (
            <div className="rounded-2xl border border-[#fee2e2] bg-white px-5 py-[60px] text-center shadow-[0_1px_4px_rgba(0,0,0,0.03)]">
              <h2 className="mb-2 text-lg font-extrabold text-[#991b1b]">Products could not be loaded</h2>
              <p className="text-sm text-[#64748b]">{error}</p>
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
              <h2 className="mb-2 text-lg font-extrabold text-[#0f172a]">No products found matching your criteria</h2>
              <p className="mb-5 text-sm text-[#64748b]">Try clearing or modifying your filters.</p>
              <button type="button" className="rounded-[30px] bg-[#d73f98] px-6 py-2.5 text-sm font-bold text-white transition hover:opacity-90" onClick={resetFilters}>
                Clear Filters
              </button>
            </div>
          )}

        </section>
      </div>
    </main>
  );
}
