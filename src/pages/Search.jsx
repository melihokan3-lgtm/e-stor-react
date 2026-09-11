import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { fetchProducts } from "../services/api";
import ProductCard from "../components/ProductCard";
import SearchProductCard from "../components/SearchProductCard";

export default function Search() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchParams] = useSearchParams();
  const filterQuery =
    searchParams.get("filter")?.toLowerCase() ||
    searchParams.get("q")?.toLowerCase() ||
    "";

  useEffect(() => {
    fetchProducts().then((data) => {
      setProducts(data);
      setLoading(false);
    });
  }, []);

  const filteredProducts = products.filter(
    (p) =>
      p.title?.toLowerCase().includes(filterQuery) ||
      p.category?.name?.toLowerCase().includes(filterQuery),
  );

  return (
    <main>
      <div className="search-page-container">
        <h2 className="search-page-title">{filterQuery || "Search"}</h2>
        {loading ? (
          <p>Loading products...</p>
        ) : (
          <div className="search-grid">
            {filteredProducts.length > 0 ? (
              filteredProducts.map((product) => (
                <SearchProductCard key={product.id} product={product} />
              ))
            ) : (
              <p>No products found.</p>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
