import { translate } from "../features/i18n/LanguageContext";
import { useState } from "react";
import { Link } from "react-router-dom";
import useProducts from "../features/products/useProducts";
import { ProductSection } from "../components/product";
import { HomeBannerCarousel, HomePromoSection } from "../components/home";
import { getTrendingProducts } from "../features/products/trending";
import type { Product } from "../types/product";
import SeoMeta from "../components/common/SeoMeta";

export default function Home() {
  const { products, loading, error } = useProducts();

  // Filters
  const [selectedTrendCat, setSelectedTrendCat] = useState("");
  const [selectedWeeklyCat, setSelectedWeeklyCat] = useState("");

  const categories = Array.from(
    new Set(
      products.map((product: Product) => product.category).filter(Boolean),
    ),
  );

  const selectedTrend = selectedTrendCat;
  const selectedWeekly = selectedWeeklyCat;

  const bannerRow1 = [
    "/img/Frame 33.png",
    "/img/Frame 34.png",
    "/img/Frame 35.png",
    "/img/Rectangle 3.png",
    "/img/Frame 366.png",
  ];

  const bannerRow2 = [
    "/img/Rectangle 3.png",
    "/img/Frame 35.png",
    "/img/Frame 34.png",
    "/img/Frame 33.png",
    "/img/Frame 366.png",
  ];

  const rankedProducts = getTrendingProducts(products);
  const trendProducts = getTrendingProducts(
    rankedProducts,
    selectedTrend,
  ).slice(0, 12);

  const weeklyProducts = getTrendingProducts(
    rankedProducts,
    selectedWeekly,
  ).slice(0, 12);

  return (
    <main className="mx-auto flex max-w-[1600px] overflow-visible bg-white font-sans text-[#333] [@media(max-width:768px)]:block">
      <SeoMeta
        title={translate("E-Storee | Online Market Alışverişi")}
        description="E-Storee ile taze market ürünlerini keşfedin, uygun fiyatlarla güvenli ve hızlı online alışveriş yapın."
        canonicalPath="/"
      />
      <h1 className="sr-only">{translate("E-Storee Online Market")}</h1>
      <div className="mx-auto w-full max-w-[1600px]">
        {error && (
          <p className="text-center text-[15px] text-[#888]">{translate(error)}</p>
        )}

        {/* ─── 1. TOP BANNER SWIPER ─── */}
        <section className="">
          <HomeBannerCarousel images={bannerRow1} reverseDirection rowKey="banner-row-1" />
          <HomeBannerCarousel images={bannerRow2} rowKey="banner-row-2" />
        </section>

        {/* ─── 2. CATEGORY PILLS ─── */}
        <section className="mb-[50px] border-b border-[#f0f0f0] pb-[30px]">
          {categories.length === 0 && !loading ? (
            <p className="text-center text-[15px] text-[#888]">
              {translate("\r\n              Kategori bulunamadı\r\n            ")}</p>
          ) : (
            <div className="flex gap-[14px] overflow-x-auto py-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {categories.map((cat) => (
                <Link
                  key={cat}
                  to={`/category?cat=${cat}`}
                  className="flex shrink-0 items-center gap-2 whitespace-nowrap rounded-[30px] border border-transparent bg-[#faf5f9] px-[22px] py-[10px] text-[14px] font-medium text-[#333] transition-all duration-200 hover:border-[#b6349a] hover:bg-white hover:text-[#b6349a]"
                >
                  <span>{cat}</span>
                </Link>
              ))}
            </div>
          )}
        </section>

        {/* ─── 3. BEST SELLER ─── */}
        <ProductSection
          title={translate("Best Seller")}
          products={rankedProducts.slice(0, 10)}
          viewAllHref="/category"
          sectionKey="best-seller"
          className="bg-transparent [@media(max-width:768px)]:px-5"
        />

        {/* ─── 6. WEEKLY SOLD — FULL WIDTH ─── */}
        <section className="relative left-1/2 box-border flex w-[100vw] max-w-[100vw] -translate-x-1/2 justify-center bg-[#faf9fa] px-5 pt-12 pb-[50px] [@media(max-width:640px)]:px-3 [@media(max-width:640px)]:pt-7 [@media(max-width:640px)]:pb-8">
          <div className="relative isolate flex w-full max-w-[1600px] flex-col overflow-hidden rounded-[24px] bg-[#712463] shadow-[0_8px_24px_rgba(31,22,29,0.025)] [@media(max-width:640px)]:rounded-[18px] [@media(max-width:480px)]:p-0">
            <div className="relative flex min-h-[119px] w-full [@media(max-width:768px)]:flex-col [@media(max-width:768px)]:items-stretch [@media(max-width:768px)]:gap-0 [@media(max-width:640px)]:block [@media(max-width:640px)]:min-h-0 [@media(max-width:480px)]:overflow-hidden [@media(max-width:480px)]:rounded-t-[18px]">
              <div className="w-full max-w-[calc(100%-235px)] rounded-tl-[24px] rounded-tr-[32px] bg-white px-5 pt-5 pb-[14px] [@media(max-width:768px)]:max-w-none [@media(max-width:640px)]:px-4 [@media(max-width:640px)]:pt-5 [@media(max-width:640px)]:pb-3 [@media(max-width:480px)]:rounded-tl-none [@media(max-width:480px)]:rounded-tr-none">
                <div className="flex flex-col gap-[14px]">
                  <h2 className="m-0 text-[16px] font-bold text-[#111]">
                    {translate("\r\n                    Trending Store Favorites\r\n                  ")}</h2>
                  <div className="flex flex-wrap gap-[10px]">
                    {categories.slice(0, 10).map((cat) => (
                      <button
                        key={cat}
                        onClick={() => setSelectedWeeklyCat(cat)}
                        className={`cursor-pointer rounded-[30px] border px-[18px] py-[7px] text-[13px] font-medium transition-all duration-200 hover:border-[#b6349a] ${selectedWeekly === cat ? "border-[#b6349a] bg-[#fdf5fd] text-[#b6349a]" : "border-[#e0e0e0] bg-white text-[#555]"}`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              <div className="w-[235px] shrink-0 grow-0 basis-[235px] rounded-none bg-white [@media(max-width:768px)]:h-[102px] [@media(max-width:768px)]:w-full [@media(max-width:768px)]:basis-auto [@media(max-width:640px)]:h-[96px] [@media(max-width:640px)]:w-full [@media(max-width:640px)]:basis-auto [@media(max-width:480px)]:overflow-hidden">
                <div className="absolute top-0 right-0 z-[1] flex h-full w-[235px] flex-col justify-center rounded-tr-[20px] rounded-bl-[20px] bg-[#712463] px-4 py-[14px] text-white [@media(max-width:768px)]:relative [@media(max-width:768px)]:top-auto [@media(max-width:768px)]:right-auto [@media(max-width:768px)]:h-[102px] [@media(max-width:768px)]:w-full [@media(max-width:640px)]:h-[96px] [@media(max-width:640px)]:w-full [@media(max-width:640px)]:rounded-[0_0_18px_18px]">
                  <div className="flex flex-col gap-[5px]">
                    <p className="m-0 flex items-center gap-[6px] text-[9px] text-[#e0d0df]">
                      <svg
                        className="size-3 text-white"
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                        <polyline points="22 4 12 14.01 9 11.01" />
                      </svg>
                      {translate("\r\n                      Freshness Guarantee\r\n                    ")}</p>
                    <h3 className="m-0 text-[18px] font-bold">
                      {translate("\r\n                      Weekly sold 1k+\r\n                    ")}</h3>
                    <Link
                      to="/category"
                      className="mt-[2px] inline-flex w-fit items-center gap-1 rounded-[30px] bg-white px-[10px] py-[5px] text-[9px] font-bold text-[#111]"
                    >
                      {translate("\r\n                      View More →\r\n                    ")}</Link>
                  </div>
                </div>
              </div>
            </div>

            <div className="relative z-[2] w-full rounded-[0_32px_24px_24px] bg-white px-5 pb-5 [&_.swiper-slide]:h-auto [&_.swiper-wrapper]:items-stretch [@media(max-width:640px)]:overflow-hidden [@media(max-width:640px)]:rounded-none [@media(max-width:640px)]:rounded-b-[18px] [@media(max-width:640px)]:bg-white [@media(max-width:640px)]:px-4 [@media(max-width:640px)]:pt-[14px] [@media(max-width:640px)]:pb-[18px]">
              <ProductSection
                title={translate("Weekly Sold")}
                products={weeklyProducts}
                variant="weekly"
                sectionKey="weekly-sold"
                embedded
              />
            </div>
          </div>
        </section>

        {/* ─── 4. TRENDING STORE FAVORITES ─── */}
        <ProductSection
          title={translate("Trending Store Favorites")}
          products={trendProducts}
          viewAllHref="/category"
          showFilters
          filterOptions={categories.slice(0, 10)}
          selectedFilter={selectedTrend}
          onFilterChange={setSelectedTrendCat}
          sectionKey="trending-favorites"
          className="bg-transparent"
        />

        {/* ─── 5. MIDDLE PROMO ─── */}
        <HomePromoSection products={rankedProducts.slice(2, 5)} categories={categories} variant="categories" />

        {/* ─── 7. BOTTOM PROMO ─── */}
        <HomePromoSection products={rankedProducts.slice(5, 8)} categories={categories} variant="stats" />
      </div>
    </main>
  );
}
