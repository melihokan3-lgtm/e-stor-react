import { useSearchParams } from "react-router-dom";
import useProducts from "../features/products/useProducts";
import SearchProductCard from "../components/product/SearchProductCard";
import LoadingState from "../components/common/LoadingState";
import { EmptyState, ErrorState } from "../components/common/ui/FeedbackState";

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
      p.category?.toLowerCase().includes(filterQuery),
  );

  return (
    <main>
      <div className="search-page-container">
        <h2 className="search-page-title">{filterQuery || "Search"}</h2>
        {loading ? (
          <LoadingState message="Loading products..." />
        ) : error ? (
          <ErrorState message={error} />
        ) : (
          <div className="search-grid">
            {filteredProducts.length > 0 ? (
              filteredProducts.map((product) => (
                <SearchProductCard key={product.id} product={product} />
              ))
            ) : (
              <EmptyState message="No products found." />
            )}
          </div>
        )}
      </div>
    </main>
  );
}
