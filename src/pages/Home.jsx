import { useState, useEffect } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Navigation } from "swiper/modules";
import { Link } from "react-router-dom";
import { fetchProducts } from "../services/api";
import ProductCard from "../components/ProductCard";
import WeeklyProductCard from "../components/WeeklyProductCard";

export default function Home() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [selectedTrendCat, setSelectedTrendCat] = useState("");
  const [selectedWeeklyCat, setSelectedWeeklyCat] = useState("");

  useEffect(() => {
    fetchProducts().then((data) => {
      setProducts(data);
      const cats = Array.from(
        new Set(data.map((p) => typeof p.category === 'string' ? p.category : p.category?.name).filter(Boolean)),
      );
      setCategories(cats);
      if (cats.length > 0) {
        setSelectedTrendCat(cats[0]);
        setSelectedWeeklyCat(cats[0]);
      }
      setLoading(false);
    });
  }, []);

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


  const trendProducts = selectedTrendCat
    ? products.filter((p) => (typeof p.category === 'string' ? p.category : p.category?.name) === selectedTrendCat)
    : products;

  const weeklyProducts = selectedWeeklyCat
    ? products.filter((p) => (typeof p.category === 'string' ? p.category : p.category?.name) === selectedWeeklyCat)
    : products;


  return (
    <main className="premium-home">
      <div className="home-container">

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
            className="banner-swiper-row"
          >
            {bannerRow1Slides.map((src, i) => (
              <SwiperSlide key={`r1-${i}`} className="banner-swiper-slide">
                <div className="banner-slide-card">
                  <img src={src} alt="Kampanya Banner" />
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
            className="banner-swiper-row"
          >
            {bannerRow2Slides.map((src, i) => (
              <SwiperSlide key={`r2-${i}`} className="banner-swiper-slide">
                <div className="banner-slide-card">
                  <img src={src} alt="Kampanya Banner" />
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        </section>

        {/* ─── 2. CATEGORY PILLS ─── */}
        <section className="category-pills-nav">
          {categories.length === 0 && !loading ? (
            <p className="no-category-msg">Kategori bulunamadı</p>
          ) : (
            <div className="category-pills-scroll">
              {categories.map((cat, i) => (
                <Link key={cat} to={`/category?cat=${cat}`} className="category-pill">
                  <span className="pill-text">{cat}</span>
                </Link>
              ))}
            </div>
          )}
        </section>

        {/* ─── 3. BEST SELLER ─── */}
        <section className="home-section">
          <div className="section-header">
            <h2>Best Seller</h2>
            <div className="header-actions">
              <Link to="/category" className="view-all-pill">Sana al →</Link>
              <div className="swiper-nav-group">
                <button className="nav-btn prev-best">‹</button>
                <button className="nav-btn next-best">›</button>
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
            className="home-swiper"
          >
            {products.slice(0, 10).map((product) => (
              <SwiperSlide key={product.id}>
                <ProductCard product={product} />
              </SwiperSlide>
            ))}
          </Swiper>
        </section>

        {/* ─── 6. WEEKLY SOLD — FULL WIDTH ─── */}
        <section className="weekly-section">
          <div className="weekly-section__box">

            <div className="weekly-section__header-row">
              <div className="weekly-section__top">
                <div className="weekly-section__header">
                  <h2>Trending Store Favorites</h2>
                  <div className="filter-pills-row">
                    {categories.slice(0, 10).map((cat) => (
                      <button
                        key={cat}
                        onClick={() => setSelectedWeeklyCat(cat)}
                        className={`filter-pill ${selectedWeeklyCat === cat ? "active" : ""}`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              <div className="weekly-section__banner-shell">
                <div className="weekly-section__banner">
                  <div className="weekly-section__banner-inner">
                    <p className="weekly-section__guarantee">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>
                      Freshness Guarantee
                    </p>
                    <h3 className="weekly-section__sold-title">Weekly sold 1k+</h3>
                    <Link to="/category" className="weekly-section__view-btn">View More →</Link>
                  </div>
                </div>
              </div>

            </div>




            <div className="weekly-section__products">
              <Swiper
                slidesPerView={2}
                spaceBetween={20}
                breakpoints={{
                  540: { slidesPerView: 3 },
                  768: { slidesPerView: 4 },
                  1024: { slidesPerView: 5 },
                }}
                className="home-swiper"
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
        <section className="home-section">
          <div className="section-header">
            <h2>Trending Store Favorites</h2>
            <Link to="/category" className="view-all-link">View All →</Link>
          </div>
          <div className="filter-row-with-nav">
            <div className="filter-pills-row">
              {categories.slice(0, 10).map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedTrendCat(cat)}
                  className={`filter-pill ${selectedTrendCat === cat ? "active" : ""}`}
                >
                  {cat}
                </button>
              ))}
            </div>
            <div className="swiper-nav-group">
              <button className="nav-btn prev-trend">‹</button>
              <button className="nav-btn next-trend">›</button>
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
            className="home-swiper"
          >
            {trendProducts.map((product) => (
              <SwiperSlide key={product.id}>
                <ProductCard product={product} />
              </SwiperSlide>
            ))}
          </Swiper>
        </section>

        {/* ─── 5. MIDDLE PROMO ─── */}
        <section className="promo-block promo-block--middle">
          <div className="promo-block__inner">
            <div className="promo-block__cards">
              {products.slice(2, 5).map((p) => (
                <div key={p.id} className="promo-card-wrap">
                  <ProductCard product={p} />
                </div>
              ))}
            </div>
            <div className="promo-block__text">
              <p className="promo-block__subtitle">Get 10% OFF On Your First Order</p>
              <h2 className="promo-block__title">Order Now Your Grocery!</h2>
              <div className="promo-block__tags">
                {categories.map((cat) => (
                  <Link key={cat} to={`/category?cat=${cat}`} className="promo-tag">
                    {cat}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ─── 7. BOTTOM PROMO ─── */}
        <section className="promo-block promo-block--bottom">
          <div className="promo-block__inner">
            <div className="promo-block__cards promo-block__cards--bottom">
              {products.slice(5, 8).map((p) => (
                <div key={p.id} className="promo-card-wrap promo-card-wrap--boxed">
                  <ProductCard product={p} />
                </div>
              ))}
            </div>
            <div className="promo-block__text">
              <p className="promo-block__subtitle">Get 10% OFF On Your First Order</p>
              <h2 className="promo-block__title">Order Now Your Grocery!</h2>
              <div className="promo-block__stats">
                <div className="promo-stat">
                  <h4>1k+</h4>
                  <p>Items</p>
                </div>
                <div className="promo-stat">
                  <h4>20</h4>
                  <p>Minutes</p>
                </div>
                <div className="promo-stat">
                  <h4>30%</h4>
                  <p>Up to off firm</p>
                </div>
              </div>
              <button className="order-now-btn">Order Now →</button>
            </div>
          </div>
        </section>



      </div>
    </main>
  );
}
