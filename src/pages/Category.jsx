import { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { fetchProducts } from "../services/api";
import ProductCard from "../components/ProductCard";

export default function Category() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchParams, setSearchParams] = useSearchParams();

  // Get filter values from URL
  const catFilter = searchParams.get("cat") || "all";
  const priceFilter = searchParams.get("price") || "all";
  const madeInFilter = searchParams.get("madein") || "all";
  const dealsFilter = searchParams.get("deals") === "true";
  const newFilter = searchParams.get("new") === "true";
  const nearFilter = searchParams.get("near") === "true";

  useEffect(() => {
    fetchProducts().then((data) => {
      setProducts(data);
      
      // Extract unique categories from data
      const categoryNames = Array.from(new Set(data.map(p => 
        typeof p.category === 'string' ? p.category : p.category?.name
      ))).filter(Boolean);
      
      const iconMap = {
        "bread": "🍞",
        "cheese": "🧀",
        "alcohol": "🍹",
        "yogurt": "🥛",
        "dairy & eggs": "🥚",
        "watermelon": "🍉",
        "snacks": "🍿",
        "cake": "🍰",
        "candy": "🍬",
        "vegetables": "🥦",
        "men's clothing": "👕",
        "jewelery": "💍",
        "electronics": "💻",
        "women's clothing": "👗"
      };

      const dynamicCategories = categoryNames.map(name => ({
        name,
        icon: iconMap[name.toLowerCase()] || "🛒"
      }));

      setCategories(dynamicCategories);
      setLoading(false);
    });
  }, []);

  const updateFilter = (key, value) => {
    const newParams = new URLSearchParams(searchParams);
    if (value === "all" || value === false || value === "") {
      newParams.delete(key);
    } else {
      newParams.set(key, value);
    }
    setSearchParams(newParams);
  };

  const resetFilters = () => {
    setSearchParams(new URLSearchParams(catFilter && catFilter !== "all" ? `cat=${catFilter}` : ""));
  };

  let filteredProducts = products;

  // Category Filter
  if (catFilter && catFilter !== "all") {
    filteredProducts = filteredProducts.filter((p) => {
      const categoryName = typeof p.category === 'string' ? p.category : p.category?.name;
      const slug = p.category?.slug || categoryName?.toLowerCase().replace(/\s+/g, "-") || p.category;
      return slug.toLowerCase() === catFilter.toLowerCase() || categoryName.toLowerCase() === catFilter.toLowerCase();
    });
  }

  // Price Filter
  if (priceFilter && priceFilter !== "all") {
    const [min, max] = priceFilter.split("-").map(Number);
    filteredProducts = filteredProducts.filter((p) => p.price >= min && p.price <= (max || Infinity));
  }

  // Dummy Filters (just for demonstration since mock API doesn't have these exact fields)
  if (dealsFilter) {
    filteredProducts = filteredProducts.filter((p) => p.price < 30); // Mock logic for Deals
  }
  if (newFilter) {
    filteredProducts = filteredProducts.slice(0, Math.max(1, filteredProducts.length / 2)); // Mock logic for New Arrivals
  }
  if (madeInFilter === "us") {
    filteredProducts = filteredProducts.filter((p) => p.price % 2 !== 0); // Mock logic for Made in US
  }

  return (
    <main className="category-page-main">
      <div className="category-page-layout">
        {/* LEFT SIDEBAR: FILTERS */}
        <aside className="category-sidebar">
          <div className="sidebar-header">
            <h3>Filters</h3>
            <button className="reset-btn" onClick={resetFilters}>Reset</button>
          </div>

          <div className="filter-group toggles-group">
            <label className="filter-toggle">
              <input
                type="checkbox"
                checked={dealsFilter}
                onChange={(e) => updateFilter("deals", e.target.checked)}
              />
              <span className="slider round"></span>
              <span className="toggle-label">Deals</span>
            </label>
            <label className="filter-toggle">
              <input
                type="checkbox"
                checked={newFilter}
                onChange={(e) => updateFilter("new", e.target.checked)}
              />
              <span className="slider round"></span>
              <span className="toggle-label">New Arrivals</span>
            </label>
            <label className="filter-toggle">
              <input
                type="checkbox"
                checked={nearFilter}
                onChange={(e) => updateFilter("near", e.target.checked)}
              />
              <span className="slider round"></span>
              <span className="toggle-label">Near Me</span>
            </label>
          </div>

          <div className="filter-group filter-list-group">
            <h4>Price</h4>
            <label className="filter-radio">
              <input 
                type="radio" 
                name="price" 
                checked={priceFilter === "all"} 
                onChange={() => updateFilter("price", "all")} 
              />
              <span className="radio-mark"></span>
              <span className="radio-label">All</span>
            </label>
            <label className="filter-radio">
              <input 
                type="radio" 
                name="price" 
                checked={priceFilter === "0-20"} 
                onChange={() => updateFilter("price", "0-20")} 
              />
              <span className="radio-mark"></span>
              <span className="radio-label">$0 - $20</span>
            </label>
            <label className="filter-radio">
              <input 
                type="radio" 
                name="price" 
                checked={priceFilter === "20-50"} 
                onChange={() => updateFilter("price", "20-50")} 
              />
              <span className="radio-mark"></span>
              <span className="radio-label">$20 - $50</span>
            </label>
            <label className="filter-radio">
              <input 
                type="radio" 
                name="price" 
                checked={priceFilter === "50-100"} 
                onChange={() => updateFilter("price", "50-100")} 
              />
              <span className="radio-mark"></span>
              <span className="radio-label">$50 - $100</span>
            </label>
            <label className="filter-radio">
              <input 
                type="radio" 
                name="price" 
                checked={priceFilter === "100-10000"} 
                onChange={() => updateFilter("price", "100-10000")} 
              />
              <span className="radio-mark"></span>
              <span className="radio-label">$100 & Above</span>
            </label>
            
            {/* Custom Min-Max Price */}
            <div className="custom-price-inputs">
              <input 
                type="number" 
                placeholder="Min" 
                id="custom-min"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    const min = document.getElementById('custom-min').value || '0';
                    const max = document.getElementById('custom-max').value || '10000';
                    updateFilter("price", `${min}-${max}`);
                  }
                }}
              />
              <span className="price-separator">-</span>
              <input 
                type="number" 
                placeholder="Max" 
                id="custom-max"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    const min = document.getElementById('custom-min').value || '0';
                    const max = document.getElementById('custom-max').value || '10000';
                    updateFilter("price", `${min}-${max}`);
                  }
                }}
              />
              <button 
                className="price-apply-btn" 
                onClick={() => {
                  const min = document.getElementById('custom-min').value || '0';
                  const max = document.getElementById('custom-max').value || '10000';
                  updateFilter("price", `${min}-${max}`);
                }}
              >
                Go
              </button>
            </div>
          </div>

          <div className="filter-group filter-list-group">
            <h4>Made in</h4>
            <label className="filter-radio">
              <input
                type="radio"
                name="madein"
                checked={madeInFilter === "all"}
                onChange={() => updateFilter("madein", "all")}
              />
              <span className="radio-mark"></span>
              <span className="radio-label">All</span>
            </label>
            <label className="filter-radio">
              <input
                type="radio"
                name="madein"
                checked={madeInFilter === "us"}
                onChange={() => updateFilter("madein", "us")}
              />
              <span className="radio-mark"></span>
              <span className="radio-label">United States</span>
            </label>
          </div>
        </aside>

        {/* RIGHT MAIN CONTENT */}
        <div className="category-main-content">

          {/* Category Nav Pills */}
          <div className="category-nav-pills">
            <Link to="/category" className={`cat-pill ${!catFilter || catFilter === 'all' ? 'active' : ''}`}>
              <span className="cat-icon">🛍️</span>
              <span className="cat-name">All</span>
            </Link>
            {categories.map((cat, i) => (
              <Link key={i} to={`/category?cat=${cat.name}`} className={`cat-pill ${catFilter.toLowerCase() === cat.name.toLowerCase() ? 'active' : ''}`}>
                <span className="cat-icon">{cat.icon}</span>
                <span className="cat-name">{cat.name}</span>
              </Link>
            ))}
          </div>

          {/* Promo Banners */}
          <div className="category-promo-banners">
            <div className="promo-banner-img">
              <img src="/img/Frame 33.png" alt="Deals" />
            </div>
            <div className="promo-banner-img">
              <img src="/img/Frame 34.png" alt="Festival" />
            </div>
            <div className="promo-banner-img">
              <img src="/img/Frame 366.png" alt="Drinks" onError={(e) => e.target.style.display = 'none'} />
            </div>
          </div>

          {/* Product Grid Header */}
          <div className="category-grid-header">
            <h2>{catFilter && catFilter !== "all" ? catFilter : "All Products"}</h2>
            <div className="grid-nav-arrows">
              <button className="nav-btn">‹</button>
              <button className="nav-btn">›</button>
            </div>
          </div>

          {/* Product Grid */}
          {loading ? (
            <p>Loading products...</p>
          ) : (
            <div className="category__container" id="category-Conteiner">
              {filteredProducts.length > 0 ? (
                filteredProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))
              ) : (
                <p>No products found for this filter.</p>
              )}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
