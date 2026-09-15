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
    <main className="min-h-[60vh] bg-white px-[60px] py-10 max-[992px]:px-6 max-[480px]:px-4">
      <div className="mx-auto w-full max-w-[1400px]">
        <h2 className="mb-6 text-xl font-bold capitalize text-[#111]">
          {filterQuery || "Search"}
        </h2>
        {loading ? (
          <LoadingState message="Loading products..." />
        ) : error ? (
          <ErrorState message={error} />
        ) : (
          <div className="grid grid-cols-5 items-stretch gap-5 max-[1200px]:grid-cols-4 max-[992px]:grid-cols-3 max-[768px]:grid-cols-2 max-[480px]:grid-cols-1">
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
