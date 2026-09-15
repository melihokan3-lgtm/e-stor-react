import { useState, useEffect, useMemo } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Navigation, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import { fetchProducts } from "../services/api/productApi";
import ProductCard from "../components/product/ProductCard";

const promoBanners = [
  { img: "/img/Frame 33.png", alt: "Special Deals", link: "/category?deals=true" },
  { img: "/img/Frame 34.png", alt: "Festival Discount", link: "/category?price=0-50" },
  { img: "/img/Frame 35.png", alt: "New Collection", link: "/category?new=true" },
  { img: "/img/Rectangle 3.png", alt: "Super Sale", link: "/category" },
  { img: "/img/Frame 366.png", alt: "Trending Drinks", link: "/category" },
];

export default function Category() {
  const [products, setProducts] = useState([]);
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
    const stats = {};
    products.forEach((p) => {
      const name = typeof p.category === "string" ? p.category : p.category?.name;
      if (name) {
        stats[name] = (stats[name] || 0) + 1;
      }
    });
    return Object.entries(stats).map(([name, count]) => ({ name, count }));
  }, [products]);

  const updateFilter = (key, value) => {
    const newParams = new URLSearchParams(searchParams);
    if (value === "all" || value === false || value === "" || value === 0) {
      newParams.delete(key);
    } else {
      newParams.set(key, value);
    }
    setSearchParams(newParams);
  };

  const handleCustomPriceSubmit = (e) => {
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
      const name = typeof p.category === "string" ? p.category : p.category?.name;
      const slug = p.category?.slug || name?.toLowerCase().replace(/\s+/g, "-") || p.category;
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
    <main className="category-page-main">
      <div className="category-page-layout">
        
        {/* MOBILE FILTER TOGGLE BUTTON */}
        <div className="mobile-filter-bar">
          <button 
            className="mobile-filter-btn"
            onClick={() => setMobileFilterOpen(!mobileFilterOpen)}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M4 21v-7M4 10V3M12 21v-9M12 8V3M20 21v-5M20 12V3M1 14h6M9 8h6M17 16h6" />
            </svg>
            <span>Filters {activeFiltersCount > 0 && `(${activeFiltersCount})`}</span>
          </button>
          
          <div className="mobile-sort-select">
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
              <option value="recommended">Recommended</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="name-asc">Product Name (A-Z)</option>
            </select>
          </div>
        </div>

        {/* LEFT SIDEBAR: TRENDYOL / HEPSIBURADA / AMAZON STYLE */}
        <aside className={`category-sidebar ${mobileFilterOpen ? "mobile-open" : ""}`}>
          <div className="sidebar-card">
            
            {/* Sidebar Header */}
            <div className="sidebar-header">
              <div className="sidebar-title-wrap">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#d73f98" strokeWidth="2.2">
                  <path d="M22 3H2l8 9.46V19l4 2v-8.54L22 3z" />
                </svg>
                <h3>Filters</h3>
                {activeFiltersCount > 0 && (
                  <span className="active-badge">{activeFiltersCount}</span>
                )}
              </div>
              {activeFiltersCount > 0 && (
                <button className="reset-btn" onClick={resetFilters}>
                  Clear All
                </button>
              )}
            </div>

            {/* Active filter chips */}
            {activeFiltersCount > 0 && (
              <div className="active-chips-container">
                {catFilter !== "all" && (
                  <span className="filter-chip" onClick={() => updateFilter("cat", "all")}>
                    {catFilter} ✕
                  </span>
                )}
                {priceFilter !== "all" && (
                  <span className="filter-chip" onClick={() => updateFilter("price", "all")}>
                    ${priceFilter} ✕
                  </span>
                )}
                {dealsFilter && (
                  <span className="filter-chip" onClick={() => updateFilter("deals", false)}>
                    Deals ✕
                  </span>
                )}
                {newFilter && (
                  <span className="filter-chip" onClick={() => updateFilter("new", false)}>
                    New Arrivals ✕
                  </span>
                )}
                {fastShippingFilter && (
                  <span className="filter-chip" onClick={() => updateFilter("fast_shipping", false)}>
                    Fast Delivery ✕
                  </span>
                )}
                {minRatingFilter > 0 && (
                  <span className="filter-chip" onClick={() => updateFilter("rating", 0)}>
                    {minRatingFilter}★+ ✕
                  </span>
                )}
              </div>
            )}

            {/* 1. CATEGORIES */}
            <div className="filter-section">
              <div className="filter-section-title">
                <span>Categories</span>
              </div>
              
              {categoryStats.length > 5 && (
                <div className="category-search-box">
                  <input
                    type="text"
                    placeholder="Search category..."
                    value={categorySearch}
                    onChange={(e) => setCategorySearch(e.target.value)}
                  />
                </div>
              )}

              <div className="category-filter-list">
                <label className={`category-filter-item ${catFilter === "all" ? "active" : ""}`}>
                  <input
                    type="radio"
                    name="category"
                    checked={catFilter === "all"}
                    onChange={() => updateFilter("cat", "all")}
                  />
                  <span className="custom-radio"></span>
                  <span className="item-name">All Categories</span>
                  <span className="item-count">({products.length})</span>
                </label>

                {filteredCategoryList.map((cat, i) => (
                  <label 
                    key={i} 
                    className={`category-filter-item ${catFilter.toLowerCase() === cat.name.toLowerCase() ? "active" : ""}`}
                  >
                    <input
                      type="radio"
                      name="category"
                      checked={catFilter.toLowerCase() === cat.name.toLowerCase()}
                      onChange={() => updateFilter("cat", cat.name)}
                    />
                    <span className="custom-radio"></span>
                    <span className="item-name">{cat.name}</span>
                    <span className="item-count">({cat.count})</span>
                  </label>
                ))}
              </div>
            </div>

            {/* 2. PRICE RANGE */}
            <div className="filter-section">
              <div className="filter-section-title">
                <span>Price Range</span>
              </div>

              {/* Quick price radios */}
              <div className="price-quick-list">
                <label className="price-quick-item">
                  <input
                    type="radio"
                    name="price_quick"
                    checked={priceFilter === "all"}
                    onChange={() => updateFilter("price", "all")}
                  />
                  <span className="custom-radio"></span>
                  <span>All Prices</span>
                </label>
                <label className="price-quick-item">
                  <input
                    type="radio"
                    name="price_quick"
                    checked={priceFilter === "0-25"}
                    onChange={() => updateFilter("price", "0-25")}
                  />
                  <span className="custom-radio"></span>
                  <span>$0 - $25</span>
                </label>
                <label className="price-quick-item">
                  <input
                    type="radio"
                    name="price_quick"
                    checked={priceFilter === "25-50"}
                    onChange={() => updateFilter("price", "25-50")}
                  />
                  <span className="custom-radio"></span>
                  <span>$25 - $50</span>
                </label>
                <label className="price-quick-item">
                  <input
                    type="radio"
                    name="price_quick"
                    checked={priceFilter === "50-100"}
                    onChange={() => updateFilter("price", "50-100")}
                  />
                  <span className="custom-radio"></span>
                  <span>$50 - $100</span>
                </label>
                <label className="price-quick-item">
                  <input
                    type="radio"
                    name="price_quick"
                    checked={priceFilter === "100-10000"}
                    onChange={() => updateFilter("price", "100-10000")}
                  />
                  <span className="custom-radio"></span>
                  <span>$100 & Above</span>
                </label>
              </div>

              {/* Min - Max custom inputs */}
              <form onSubmit={handleCustomPriceSubmit} className="price-inputs-form">
                <div className="price-input-group">
                  <input
                    type="number"
                    placeholder="Min"
                    value={minPriceInput}
                    onChange={(e) => setMinPriceInput(e.target.value)}
                  />
                  <span className="price-dash">-</span>
                  <input
                    type="number"
                    placeholder="Max"
                    value={maxPriceInput}
                    onChange={(e) => setMaxPriceInput(e.target.value)}
                  />
                  <button type="submit" className="price-go-btn" title="Apply Filter">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                      <path d="M5 12h14M12 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
              </form>
            </div>

            {/* 3. DEALS & PERKS */}
            <div className="filter-section">
              <div className="filter-section-title">
                <span>Deals & Perks</span>
              </div>
              <div className="toggle-list">
                <label className="filter-switch-row">
                  <div className="switch-text">
                    <span className="switch-title">Discounted Products</span>
                    <span className="switch-desc">Special promotions</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={dealsFilter}
                    onChange={(e) => updateFilter("deals", e.target.checked)}
                  />
                  <span className="switch-slider"></span>
                </label>

                <label className="filter-switch-row">
                  <div className="switch-text">
                    <span className="switch-title">New Arrivals</span>
                    <span className="switch-desc">Recently added</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={newFilter}
                    onChange={(e) => updateFilter("new", e.target.checked)}
                  />
                  <span className="switch-slider"></span>
                </label>

                <label className="filter-switch-row">
                  <div className="switch-text">
                    <span className="switch-title">Fast Delivery</span>
                    <span className="switch-desc">Ships today</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={fastShippingFilter}
                    onChange={(e) => updateFilter("fast_shipping", e.target.checked)}
                  />
                  <span className="switch-slider"></span>
                </label>
              </div>
            </div>

            {/* 4. CUSTOMER RATING */}
            <div className="filter-section">
              <div className="filter-section-title">
                <span>Customer Rating</span>
              </div>
              <div className="rating-filter-list">
                {[4, 3, 2].map((stars) => (
                  <label key={stars} className="rating-filter-item">
                    <input
                      type="radio"
                      name="rating"
                      checked={minRatingFilter === stars}
                      onChange={() => updateFilter("rating", minRatingFilter === stars ? 0 : stars)}
                    />
                    <span className="custom-radio"></span>
                    <div className="rating-stars">
                      {"★".repeat(stars)}{"☆".repeat(5 - stars)}
                    </div>
                    <span className="rating-text">& up</span>
                  </label>
                ))}
              </div>
            </div>

          </div>
        </aside>

        {/* RIGHT MAIN CONTENT */}
        <section className="category-main-content">
          
          {/* Top category nav pills */}
          <div className="category-nav-pills-wrap">
            <Link
              to="/category"
              className={`cat-pill ${!catFilter || catFilter === "all" ? "active" : ""}`}
            >
              All ({products.length})
            </Link>
            {categoryStats.map((cat, i) => (
              <Link
                key={i}
                to={`/category?cat=${encodeURIComponent(cat.name)}`}
                className={`cat-pill ${catFilter.toLowerCase() === cat.name.toLowerCase() ? "active" : ""}`}
              >
                {cat.name} ({cat.count})
              </Link>
            ))}
          </div>

          {/* Top Promo Banners Swiper */}
          <div className="category-promo-banners">
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
              className="category-promo-swiper"
            >
              {promoBanners.map((banner, i) => (
                <SwiperSlide key={i} className="promo-slide">
                  <Link to={banner.link} className="promo-banner-card">
                    <img src={banner.img} alt={banner.alt} />
                  </Link>
                </SwiperSlide>
              ))}
            </Swiper>
          </div>

          {/* Results Toolbar / Sort */}
          <div className="category-toolbar">
            <div className="toolbar-info">
              <h2>{catFilter && catFilter !== "all" ? catFilter : "All Products"}</h2>
              <span className="results-count">
                (<strong>{filtered.length}</strong> products found)
              </span>
            </div>

            <div className="toolbar-sort">
              <span className="sort-label">Sort by:</span>
              <select 
                value={sortBy} 
                onChange={(e) => setSortBy(e.target.value)}
                className="sort-dropdown"
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
            <div className="category-loading-state">
              <div className="spinner"></div>
              <p>Loading products...</p>
            </div>
          ) : filtered.length > 0 ? (
            <div className="category__container" id="category-Conteiner">
              {filtered.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="category-empty-state">
              <div className="empty-icon">🔍</div>
              <h3>No products found matching your criteria</h3>
              <p>Try clearing or modifying your filters.</p>
              <button className="empty-reset-btn" onClick={resetFilters}>
                Clear Filters
              </button>
            </div>
          )}

        </section>
      </div>
    </main>
  );
}
