import { useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Navigation } from "swiper/modules";
import { Link } from "react-router-dom";
import useProducts from "../features/products/useProducts";
import ProductCard from "../components/product/ProductCard";
import WeeklyProductCard from "../components/product/WeeklyProductCard";
import type { Product } from "../types/product";

export default function Home() {
  const { products, loading, error } = useProducts();

  // Filters
  const [selectedTrendCat, setSelectedTrendCat] = useState("");
  const [selectedWeeklyCat, setSelectedWeeklyCat] = useState("");

  const categories = Array.from(new Set(products.map((product: Product) => product.category).filter(Boolean)));

  const selectedTrend = selectedTrendCat || categories[0] || "";
  const selectedWeekly = selectedWeeklyCat || categories[0] || "";

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

  const bannerRow1Slides = [...bannerRow1, ...bannerRow1, ...bannerRow1, ...bannerRow1];
  const bannerRow2Slides = [...bannerRow2, ...bannerRow2, ...bannerRow2, ...bannerRow2];


  const trendProducts = selectedTrend
    ? products.filter((product) => product.category === selectedTrend)
    : products;

  const weeklyProducts = selectedWeekly
    ? products.filter((product) => product.category === selectedWeekly)
    : products;


  return (
    <main className="mx-auto flex max-w-[1600px] overflow-visible bg-white font-sans text-[#333] [@media(max-width:768px)]:block">
      <div className="mx-auto w-full max-w-[1600px]">
        {error && <p className="text-center text-[15px] text-[#888]">{error}</p>}

        {/* ─── 1. TOP BANNER SWIPER ─── */}
        <section className="">
          {/* Row 1 */}
          <Swiper
            modules={[Autoplay]}
            autoplay={{
              delay: 3000,
              disableOnInteraction: false,
              pauseOnMouseEnter: true,
              reverseDirection: true
            }}
            loop={true}
            slidesPerView="auto"
            spaceBetween={20}
            speed={600}
            grabCursor={true}
            className="w-full overflow-hidden py-1"
          >
            {bannerRow1Slides.map((src, i) => (
              <SwiperSlide key={`r1-${i}`} className="w-auto!">
                <div className="flex h-[250px] cursor-grab overflow-hidden rounded-[20px] bg-[#f8f8f8] shadow-[0_4px_16px_rgba(0,0,0,0.06)] transition-[transform,box-shadow] duration-[250ms] hover:-translate-y-[2px] hover:shadow-[0_8px_24px_rgba(0,0,0,0.1)] active:cursor-grabbing [@media(max-width:640px)]:h-[160px] [@media(max-width:480px)]:h-[135px]">
                  <img src={src} alt="Kampanya Banner" className="pointer-events-none block h-full w-auto max-w-full select-none rounded-[20px] object-cover [-webkit-user-drag:none]" />
                </div>
              </SwiperSlide>
            ))}
          </Swiper>

          {/* Row 2 */}
          <Swiper
            modules={[Autoplay]}
            autoplay={{
              delay: 3000,
              disableOnInteraction: false,
              pauseOnMouseEnter: true,
              reverseDirection: true
            }}
            loop={true}
            slidesPerView="auto"
            spaceBetween={20}
            speed={600}
            grabCursor={true}
            className="w-full overflow-hidden py-1"
          >
            {bannerRow2Slides.map((src, i) => (
              <SwiperSlide key={`r2-${i}`} className="w-auto!">
                <div className="flex h-[250px] cursor-grab overflow-hidden rounded-[20px] bg-[#f8f8f8] shadow-[0_4px_16px_rgba(0,0,0,0.06)] transition-[transform,box-shadow] duration-[250ms] hover:-translate-y-[2px] hover:shadow-[0_8px_24px_rgba(0,0,0,0.1)] active:cursor-grabbing [@media(max-width:640px)]:h-[160px] [@media(max-width:480px)]:h-[135px]">
                  <img src={src} alt="Kampanya Banner" className="pointer-events-none block h-full w-auto max-w-full select-none rounded-[20px] object-cover [-webkit-user-drag:none]" />
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        </section>

        {/* ─── 2. CATEGORY PILLS ─── */}
        <section className="mb-[50px] border-b border-[#f0f0f0] pb-[30px]">
          {categories.length === 0 && !loading ? (
            <p className="text-center text-[15px] text-[#888]">Kategori bulunamadı</p>
          ) : (
            <div className="flex gap-[14px] overflow-x-auto py-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {categories.map((cat) => (
                <Link key={cat} to={`/category?cat=${cat}`} className="flex shrink-0 items-center gap-2 whitespace-nowrap rounded-[30px] border border-transparent bg-[#faf5f9] px-[22px] py-[10px] text-[14px] font-medium text-[#333] transition-all duration-200 hover:border-[#b6349a] hover:bg-white hover:text-[#b6349a]">
                  <span>{cat}</span>
                </Link>
              ))}
            </div>
          )}
        </section>

        {/* ─── 3. BEST SELLER ─── */}
        <section className="mb-[60px] [@media(max-width:768px)]:px-5">
          <div className="mb-6 flex items-center justify-between [@media(max-width:768px)]:flex-col [@media(max-width:768px)]:items-start [@media(max-width:768px)]:gap-3">
            <h2 className="m-0 text-[24px] font-bold text-[#111]">Best Seller</h2>
            <div className="flex items-center gap-[14px]">
              <Link to="/category" className="inline-block rounded-[30px] border-[1.5px] border-[#e0e0e0] px-5 py-2 text-[13px] font-semibold text-[#333] transition-all duration-200 hover:border-[#b6349a] hover:text-[#b6349a]">Sana al →</Link>
              <div className="flex gap-3">
                <button className="prev-best flex size-10 cursor-pointer items-center justify-center rounded-full border border-[#eee] bg-white text-[20px] text-[#555] transition-all duration-200 hover:border-[#b6349a] hover:bg-[#fdf5fb] hover:text-[#b6349a]">‹</button>
                <button className="next-best flex size-10 cursor-pointer items-center justify-center rounded-full border border-[#eee] bg-white text-[20px] text-[#555] transition-all duration-200 hover:border-[#b6349a] hover:bg-[#fdf5fb] hover:text-[#b6349a]">›</button>
              </div>
            </div>
          </div>
          <Swiper
            modules={[Navigation]}
            navigation={{ nextEl: ".next-best", prevEl: ".prev-best" }}
            slidesPerView={2}
            spaceBetween={20}
            breakpoints={{
              540: { slidesPerView: 3 },
              768: { slidesPerView: 4 },
              1024: { slidesPerView: 5 },
            }}
            className="w-full"
          >
            {products.slice(0, 10).map((product) => (
              <SwiperSlide key={product.id}>
                <ProductCard product={product} />
              </SwiperSlide>
            ))}
          </Swiper>
        </section>

        {/* ─── 6. WEEKLY SOLD — FULL WIDTH ─── */}
        <section className="relative left-1/2 box-border flex w-[100vw] max-w-[100vw] -translate-x-1/2 justify-center bg-[#faf9fa] px-5 pt-12 pb-[50px] [@media(max-width:640px)]:px-3 [@media(max-width:640px)]:pt-7 [@media(max-width:640px)]:pb-8">
          <div className="relative isolate flex w-full max-w-[1600px] flex-col overflow-hidden rounded-[24px] bg-[#712463] shadow-[0_8px_24px_rgba(31,22,29,0.025)] [@media(max-width:640px)]:rounded-[18px] [@media(max-width:480px)]:p-0">

            <div className="relative flex min-h-[119px] w-full [@media(max-width:768px)]:flex-col [@media(max-width:768px)]:items-stretch [@media(max-width:768px)]:gap-0 [@media(max-width:640px)]:block [@media(max-width:640px)]:min-h-0 [@media(max-width:480px)]:overflow-hidden [@media(max-width:480px)]:rounded-t-[18px]">
              <div className="w-full max-w-[calc(100%-235px)] rounded-tl-[24px] rounded-tr-[32px] bg-white px-5 pt-5 pb-[14px] [@media(max-width:768px)]:max-w-none [@media(max-width:640px)]:px-4 [@media(max-width:640px)]:pt-5 [@media(max-width:640px)]:pb-3 [@media(max-width:480px)]:rounded-tl-none [@media(max-width:480px)]:rounded-tr-none">
                <div className="flex flex-col gap-[14px]">
                  <h2 className="m-0 text-[16px] font-bold text-[#111]">Trending Store Favorites</h2>
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
                      <svg className="size-3 text-white" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>
                      Freshness Guarantee
                    </p>
                    <h3 className="m-0 text-[18px] font-bold">Weekly sold 1k+</h3>
                    <Link to="/category" className="mt-[2px] inline-flex w-fit items-center gap-1 rounded-[30px] bg-white px-[10px] py-[5px] text-[9px] font-bold text-[#111]">View More →</Link>
                  </div>
                </div>
              </div>

            </div>




            <div className="relative z-[2] w-full rounded-[0_32px_24px_24px] bg-white px-5 pb-5 [&_.swiper-slide]:h-auto [&_.swiper-wrapper]:items-stretch [@media(max-width:640px)]:overflow-hidden [@media(max-width:640px)]:rounded-b-[18px] [@media(max-width:640px)]:bg-white [@media(max-width:640px)]:px-4 [@media(max-width:640px)]:pt-[14px] [@media(max-width:640px)]:pb-[18px]">
              <Swiper
                slidesPerView={2}
                spaceBetween={20}
                breakpoints={{
                  540: { slidesPerView: 3 },
                  768: { slidesPerView: 4 },
                  1024: { slidesPerView: 5 },
                }}
                className="w-full"
              >
                {weeklyProducts.map((product) => (
                  <SwiperSlide key={product.id}>
                    <WeeklyProductCard product={product} />
                  </SwiperSlide>
                ))}
              </Swiper>
            </div>

          </div>
        </section>

        {/* ─── 4. TRENDING STORE FAVORITES ─── */}
        <section className="mb-[60px] rounded-[24px] bg-transparent px-6 py-7 [@media(max-width:768px)]:px-4 [@media(max-width:640px)]:rounded-[18px] [@media(max-width:640px)]:py-5">
          <div className="mb-6 flex items-center justify-between [@media(max-width:768px)]:flex-col [@media(max-width:768px)]:items-start [@media(max-width:768px)]:gap-3">
            <h2 className="m-0 text-[24px] font-bold tracking-normal text-[#111] [@media(max-width:640px)]:text-[20px]">Trending Store Favorites</h2>
            <Link to="/category" className="inline-flex items-center rounded-[30px] border border-[#b6349a] bg-white px-4 py-2 text-[13px] font-semibold text-[#b6349a] transition-colors duration-200 hover:bg-[#b6349a] hover:text-white">View All →</Link>
          </div>
          <div className="mb-6 flex items-start justify-between gap-5 [@media(max-width:768px)]:flex-col [@media(max-width:768px)]:gap-3">
            <div className="flex flex-wrap gap-[10px]">
              {categories.slice(0, 10).map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedTrendCat(cat)}
                  className={`cursor-pointer rounded-[30px] border px-[18px] py-[7px] text-[13px] font-medium transition-all duration-200 hover:border-[#b6349a] ${selectedTrend === cat ? "border-[#b6349a] bg-[#fdf5fd] text-[#b6349a]" : "border-[#e0e0e0] bg-white text-[#555]"}`}
                >
                  {cat}
                </button>
              ))}
            </div>
            <div className="flex gap-3">
              <button className="prev-trend flex size-10 cursor-pointer items-center justify-center rounded-full border border-[#eee] bg-white text-[20px] text-[#555] transition-all duration-200 hover:border-[#b6349a] hover:bg-[#fdf5fb] hover:text-[#b6349a]">‹</button>
              <button className="next-trend flex size-10 cursor-pointer items-center justify-center rounded-full border border-[#eee] bg-white text-[20px] text-[#555] transition-all duration-200 hover:border-[#b6349a] hover:bg-[#fdf5fb] hover:text-[#b6349a]">›</button>
            </div>
          </div>
          <Swiper
            modules={[Navigation]}
            navigation={{ nextEl: ".next-trend", prevEl: ".prev-trend" }}
            slidesPerView={2}
            spaceBetween={20}
            breakpoints={{
              540: { slidesPerView: 3 },
              768: { slidesPerView: 4 },
              1024: { slidesPerView: 5 },
            }}
            className="w-full"
          >
            {trendProducts.map((product) => (
              <SwiperSlide key={product.id}>
                <ProductCard product={product} />
              </SwiperSlide>
            ))}
          </Swiper>
        </section>

        {/* ─── 5. MIDDLE PROMO ─── */}
        <section className="mb-[60px] rounded-[24px] bg-[#fef9fc] p-10 [@media(max-width:768px)]:p-6 [@media(max-width:480px)]:p-4">
          <div className="flex items-center gap-10 [@media(max-width:1024px)]:flex-col-reverse">
            <div className="grid min-w-0 flex-[2] grid-cols-3 gap-5 [@media(max-width:1024px)]:w-full [@media(max-width:768px)]:grid-cols-2 [@media(max-width:480px)]:grid-cols-1!">
              {products.slice(2, 5).map((p) => (
                <div key={p.id} className="flex h-full min-w-0 flex-col">
                  <ProductCard product={p} />
                </div>
              ))}
            </div>
            <div className="min-w-0 flex-1 [@media(max-width:1024px)]:w-full">
              <p className="mb-[10px] text-[14px] font-bold text-[#b6349a]">Get 10% OFF On Your First Order</p>
              <h2 className="mb-6 text-[34px] font-extrabold leading-[1.2] text-[#111] [@media(max-width:480px)]:text-[26px]">Order Now Your Grocery!</h2>
              <div className="flex flex-wrap gap-[10px]">
                {categories.map((cat) => (
                  <Link key={cat} to={`/category?cat=${cat}`} className="rounded-[30px] border border-[#e0e0e0] bg-white px-4 py-[7px] text-[13px] font-medium text-[#444] transition-colors duration-200 hover:border-[#b6349a] hover:text-[#b6349a]">
                    {cat}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ─── 7. BOTTOM PROMO ─── */}
        <section className="mb-[60px] rounded-[24px] bg-[#fdf5f8] p-10 [@media(max-width:768px)]:p-6 [@media(max-width:480px)]:p-4">
          <div className="flex items-center gap-10 [@media(max-width:1024px)]:flex-col-reverse">
            <div className="grid min-w-0 flex-[2] grid-cols-3 gap-5 [@media(max-width:1024px)]:w-full [@media(max-width:768px)]:grid-cols-2 [@media(max-width:480px)]:grid-cols-1!">
              {products.slice(5, 8).map((p) => (
                <div key={p.id} className="flex h-full min-w-0 flex-col rounded-[20px] bg-white p-[14px] shadow-[0_6px_20px_rgba(0,0,0,0.04)] transition-transform duration-200 hover:-translate-y-1 [&_.card-img-wrapper]:bg-[#faf8fa]">
                  <ProductCard product={p} />
                </div>
              ))}
            </div>
            <div className="min-w-0 flex-1 [@media(max-width:1024px)]:w-full">
              <p className="mb-[10px] text-[14px] font-bold text-[#b6349a]">Get 10% OFF On Your First Order</p>
              <h2 className="mb-6 text-[34px] font-extrabold leading-[1.2] text-[#111] [@media(max-width:480px)]:text-[26px]">Order Now Your Grocery!</h2>
              <div className="mb-7 flex gap-7">
                <div>
                  <h4 className="mb-1 text-[26px] font-extrabold text-[#111]">1k+</h4>
                  <p className="text-[12px] font-medium text-[#777]">Items</p>
                </div>
                <div>
                  <h4 className="mb-1 text-[26px] font-extrabold text-[#111]">20</h4>
                  <p className="text-[12px] font-medium text-[#777]">Minutes</p>
                </div>
                <div>
                  <h4 className="mb-1 text-[26px] font-extrabold text-[#111]">30%</h4>
                  <p className="text-[12px] font-medium text-[#777]">Up to off firm</p>
                </div>
              </div>
              <button className="cursor-pointer rounded-[30px] bg-[#b6349a] px-[34px] py-[14px] text-[15px] font-bold text-white transition-colors duration-200 hover:bg-[#92277a]">Order Now →</button>
            </div>
          </div>
        </section>



      </div>
    </main>
  );
}
