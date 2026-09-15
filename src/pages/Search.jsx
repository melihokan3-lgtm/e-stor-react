import { useSearchParams } from "react-router-dom";
import useProducts from "../features/products/useProducts";
import ProductCard from "../components/product/ProductCard";
import SearchProductCard from "../components/product/SearchProductCard";

export default function Search() {
  const { products, loading, error } = useProducts();
  const [searchParams] = useSearchParams();
  const filterQuery =
    searchParams.get("filter")?.toLowerCase() ||
    searchParams.get("q")?.toLowerCase() ||
    "";

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
        ) : error ? (
          <p>{error}</p>
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
