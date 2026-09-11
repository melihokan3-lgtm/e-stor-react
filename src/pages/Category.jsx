import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { fetchProducts } from "../services/api";
import ProductCard from "../components/ProductCard";

export default function Category() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchParams] = useSearchParams();
  const priceFilter = searchParams.get("price"); // "0-50", "50-100", "100-10000"
  const catFilter = searchParams.get("cat");

  useEffect(() => {
    fetchProducts().then((data) => {
      setProducts(data);
      setLoading(false);
    });
  }, []);

  let filteredProducts = products;
  
  if (priceFilter) {
    const [min, max] = priceFilter.split("-").map(Number);
    filteredProducts = filteredProducts.filter((p) => p.price >= min && p.price <= max);
  }
  
  if (catFilter && catFilter !== "all") {
    filteredProducts = filteredProducts.filter((p) => {
      const categoryName = typeof p.category === 'string' ? p.category : p.category?.name;
      const slug = p.category?.slug || categoryName?.toLowerCase().replace(/\s+/g, "-") || p.category;
      return slug === catFilter || categoryName === catFilter;
    });
  }

  return (
    <main>
      <div className="category__container__div">
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
    </main>
  );
}
