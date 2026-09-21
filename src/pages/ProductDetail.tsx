import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Swiper, SwiperSlide } from "swiper/react";
import {
  fetchProductById,
  fetchProducts,
  cleanImageUrl,
  FALLBACK_IMG,
} from "../services/api/productApi";
import { useCart } from "../features/cart/CartContext";
import { ProductCard } from "../components/product";
import type { Product } from "../types/product";
import SeoMeta from "../components/common/SeoMeta";

const PUBLIC_SITE_URL = "https://e-stor-react-nttt.vercel.app";

const StarIcon = ({
  filled = true,
  width = 14,
  height = 14,
}: {
  filled?: boolean;
  width?: number;
  height?: number;
}) => (
  <svg
    width={width}
    height={height}
    viewBox="0 0 24 24"
    fill={filled ? "#ffc107" : "none"}
    stroke={filled ? "#ffc107" : "#ddd"}
    strokeWidth="2"
    xmlns="http://www.w3.org/0000/svg"
  >
    <path
      d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export default function ProductDetail() {
  const { categorySlug, productId } = useParams();
  const { addToCart } = useCart();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [activeImgIndex, setActiveImgIndex] = useState(0);

  const [recommended, setRecommended] = useState<Product[]>([]);

  useEffect(() => {
    let active = true;
    window.scrollTo(0, 0);
    setLoading(true);
    setError(false);
    setProduct(null);
    setActiveImgIndex(0);

    if (!productId) {
      setError(true);
      setLoading(false);
      return;
    }

    fetchProductById(productId)
      .then(async (data) => {
        if (!data) {
          const all = await fetchProducts();
          const found = all.find(
            (p) =>
              p.id.toString() === productId ||
              p.title?.toLowerCase().replace(/\s+/g, "-") === productId,
          );
          if (found) return found;

          return null;
        }
        return data;
      })
      .then((data) => {
        if (!active) return;
        if (data) setProduct(data);
        else setError(true);
      })
      .catch(() => {
        if (active) setError(true);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    fetchProducts()
      .then((all) => {
        if (active) setRecommended(all.slice(0, 10));
      })
      .catch(() => {
        if (active) setRecommended([]);
      });

    return () => {
      active = false;
    };
  }, [productId]);

  if (loading)
    return (
      <main className="min-h-screen bg-white">
        <SeoMeta title="Ürün Detayı | E-Storee" description="E-Storee ürün detaylarını inceleyin ve online sipariş verin." canonicalPath={`/${categorySlug || "category"}/${productId || "product"}`} />
        <div className="mx-auto w-full max-w-7xl px-5 py-10">
          <p>Loading product details...</p>
        </div>
      </main>
    );
  if (error || !product)
    return (
      <main className="min-h-screen bg-white">
        <SeoMeta title="Ürün Bulunamadı | E-Storee" description="Aradığınız ürün bulunamadı." canonicalPath={`/${categorySlug || "category"}/${productId || "product"}`} robots="noindex,nofollow" />
        <div className="mx-auto w-full max-w-7xl px-5 py-10">
          <p>Product not found.</p>
        </div>
      </main>
    );

  const images = product.image ? [product.image] : product.images || [];
  const mainImg =
    images.length > 0 ? cleanImageUrl(images[activeImgIndex]) : FALLBACK_IMG;
  const productPath = `/${categorySlug || product.category.toLowerCase().replace(/\s+/g, "-") || "category"}/${productId}`;
  const productImageUrls = images
    .map((image) => cleanImageUrl(image))
    .filter((image) => image && !image.startsWith("data:"))
    .map((image) => image.startsWith("http") ? image : `${PUBLIC_SITE_URL}${image.startsWith("/") ? "" : "/"}${image}`);
  const productStructuredData: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.title,
    description: product.description || `${product.title} ürününü E-Storee'de keşfedin.`,
    ...(productImageUrls.length > 0 ? { image: productImageUrls } : {}),
    sku: String(product.id),
    category: product.category,
    ...(product.brand ? { brand: { "@type": "Brand", name: product.brand } } : {}),
    offers: {
      "@type": "Offer",
      url: `https://e-stor-react-nttt.vercel.app${productPath}`,
      priceCurrency: "USD",
      price: product.price.toFixed(2),
      availability: product.stock === 0 ? "https://schema.org/OutOfStock" : "https://schema.org/InStock",
      itemCondition: "https://schema.org/NewCondition",
    },
    ...(product.rating?.rate && product.rating.count ? {
      aggregateRating: {
        "@type": "AggregateRating",
        ratingValue: product.rating.rate,
        ratingCount: product.rating.count,
      },
    } : {}),
  };

  return (
    <main className="mx-auto flex w-full max-w-[1544px] flex-col px-5 pb-8">
      <SeoMeta
        title={`${product.title} | E-Storee`}
        description={(product.description || `${product.title} ürününü E-Storee'de keşfedin ve online sipariş verin.`).slice(0, 160)}
        canonicalPath={productPath}
        structuredData={productStructuredData}
      />
      <nav aria-label="Breadcrumb" className="flex max-w-[1544px] items-center gap-1 pt-5 text-2xl text-[#5f6980]">
        <Link to="/"> Home &gt; &nbsp; </Link>
        <Link to="/category"> Category &gt; &nbsp; </Link>
        <span className="text-[#b6349a]"> Details </span>
      </nav>

      <div className="mx-auto w-full max-w-[1544px]">
        <div className="mt-5 flex flex-col gap-[50px] bg-white lg:flex-row">
          <div className="flex w-full flex-col items-center gap-5 rounded-[20px] border border-[#f4f0f0] bg-[#fdfdfd] p-[30px] shadow-[var(--shadow-sm)] lg:w-1/2">
            <img
              className="max-h-[640px] max-w-full object-contain"
              src={mainImg}
              alt={product.title}
              width={640}
              height={640}
              fetchPriority="high"
              decoding="async"
              onError={(e) => {
                e.currentTarget.onerror = null;
                e.currentTarget.src = FALLBACK_IMG;
              }}
            />
            <div className="flex gap-5 overflow-x-auto">
              {images.map((imgUrl, idx) => (
                <button
                  key={`${imgUrl}-${idx}`}
                  type="button"
                  aria-label={`${product.title} görsel ${idx + 1}`}
                  aria-pressed={activeImgIndex === idx}
                  onClick={() => setActiveImgIndex(idx)}
                  className={`h-20 w-[100px] max-w-full rounded-2xl border-2 p-1 ${activeImgIndex === idx ? "border-[#b6349a]" : "border-transparent"}`}
                >
                  <img
                  src={cleanImageUrl(imgUrl)}
                  alt=""
                  aria-hidden="true"
                  width={100}
                  height={80}
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = FALLBACK_IMG;
                  }}
                  className="h-full w-full object-contain"
                  />
                </button>
              ))}
            </div>
          </div>

          <div className="flex w-full flex-col gap-[30px] px-2.5 py-[30px] lg:w-1/2">
            <div>
              <h1 className="text-3xl font-bold text-black">{product.title}</h1>
              {product.description && (
                <p className="mt-3 mb-4 leading-6 text-[#555]">
                  {product.description}
                </p>
              )}
              <div className="mt-5">
                <p className="mb-2 text-sm text-[#888]">$2.71/lb</p>
                <div className="flex items-center gap-2.5">
                  <p className="text-[32px] font-bold text-black">
                    ${product.price}
                  </p>
                  <span className="text-lg text-[#888] line-through">
                    $99.99
                  </span>
                </div>
                <p className="mt-2 text-sm font-bold text-[#b6349a]">12 Left</p>
              </div>
            </div>

            <button
              className="mt-7 inline-flex w-fit items-center gap-2 rounded-xl bg-[#b6349a] px-6 py-3 font-semibold text-white transition hover:bg-[#98277f]"
              onClick={() => addToCart(product)}
            >
              <svg
                className="h-6 w-6"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/0000/svg"
              >
                <path
                  d="M2 2H3.74001C4.82001 2 5.67 2.93 5.58 4L4.75 13.96C4.61 15.59 5.89999 16.99 7.53999 16.99H18.19C19.63 16.99 20.89 15.81 21 14.38L21.54 6.88C21.66 5.22 20.4 3.87 18.73 3.87H5.82001"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeMiterlimit="10"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M16.25 22C16.9404 22 17.5 21.4404 17.5 20.75C17.5 20.0596 16.9404 19.5 16.25 19.5C15.5596 19.5 15 20.0596 15 20.75C15 21.4404 15.5596 22 16.25 22Z"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeMiterlimit="10"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M8.25 22C8.94036 22 9.5 21.4404 9.5 20.75C9.5 20.0596 8.94036 19.5 8.25 19.5C7.55964 19.5 7 20.0596 7 20.75C7 21.4404 7.55964 22 8.25 22Z"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeMiterlimit="10"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M9 8H21"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeMiterlimit="10"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              Add To Cart
            </button>

            <div className="mt-8 border-t border-[#eee] pt-6">
              <h2 className="mb-4 text-[22px] font-medium text-[#6b7280]">
                About Product
              </h2>
              <div className="mb-3 flex items-center gap-3 text-[22px]">
                <div className="grid h-[50px] w-[50px] shrink-0 place-items-center rounded-full bg-[#fff0fa] text-base">
                  🏆
                </div>
                <p className="flex-1 font-medium text-[#1f2937]">
                  Best Seller Product
                </p>
                <a
                  href="#"
                  className="ml-auto whitespace-nowrap text-base font-semibold text-[#b6349a]"
                >
                  View More &gt;
                </a>
              </div>
              <div className="flex items-center gap-3 text-[22px]">
                <div className="grid h-[50px] w-[50px] shrink-0 place-items-center rounded-full bg-[#ecfdf5] text-base">
                  ✔
                </div>
                <p className="flex-1 font-medium text-[#1f2937]">
                  100% satisfaction guarantee
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* CUSTOMER REVIEWS SECTION */}
        <section className="rounded-2xl border border-[#eee] p-6">
          <div className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr]">
            <div>
              <h2 className="mb-2.5 text-2xl">Customer Reviews</h2>
              <p className="text-sm text-[#777]">Average rating: 4.5 (5391)</p>
              <div className="mt-5 space-y-3">
                {[5, 4, 3, 2, 1].map((star) => (
                  <div key={star} className="flex items-center gap-3">
                    <span className="flex w-10 items-center gap-1 text-sm">
                      {star} <StarIcon filled={false} />
                    </span>
                    <div className="h-2 flex-1 overflow-hidden rounded-full bg-[#eee]">
                      <div
                        className="h-full bg-[#b6349a]"
                        style={{ width: `${star * 20}%` }}
                      ></div>
                    </div>
                    <span className="text-xs text-[#777]">4.28K</span>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <details open>
                <summary className="flex cursor-pointer list-none items-center justify-between border-b border-[#eee] pb-3">
                  <h3 className="font-semibold">Reviews</h3>
                  <span className="text-sm text-[#777]">Recent</span>
                </summary>

                <div className="space-y-5 pt-4">
                  <div className="border-b border-[#eee] pb-5">
                    <h4 className="font-semibold">Perfect Combination!!</h4>
                    <div className="my-2 flex gap-1">
                      <StarIcon />
                      <StarIcon />
                      <StarIcon />
                      <StarIcon />
                      <StarIcon filled={false} />
                    </div>
                    <p className="text-sm leading-6 text-[#666]">
                      This review was collected as part of a promotion.) I
                      forgot to post my photos from my review! So here is my
                      review again. A perfect combination of softness, strength,
                      and proper friction to make any user leaving clean and
                      spotless!!
                    </p>
                  </div>

                  <div>
                    <h4 className="font-semibold">Perfect Combination!!</h4>
                    <div className="my-2 flex gap-1">
                      <StarIcon />
                      <StarIcon />
                      <StarIcon />
                      <StarIcon />
                      <StarIcon filled={false} />
                    </div>
                    <p className="text-sm leading-6 text-[#666]">
                      This review was collected as part of a promotion.) A
                      perfect combination of softness, strength, and proper
                      friction for a clean result.
                    </p>
                  </div>
                </div>
              </details>
            </div>
          </div>
        </section>

        {/* ACCORDION SECTION */}
        <section className="space-y-2">
          <details className="rounded-xl border border-[#eee] p-4" open>
            <summary className="cursor-pointer font-semibold">Details</summary>
            <div className="pt-3 text-sm leading-6 text-[#666]">
              {product.description ||
                "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua."}
            </div>
          </details>
          <details className="rounded-xl border border-[#eee] p-4">
            <summary className="cursor-pointer font-semibold">
              Conservation and storage
            </summary>
            <div className="pt-3 text-sm leading-6 text-[#666]">
              Store in a cool, dry place. Keep away from direct sunlight.
            </div>
          </details>
          <details className="rounded-xl border border-[#eee] p-4">
            <summary className="cursor-pointer font-semibold">
              Ingredients
            </summary>
            <div className="pt-3 text-sm leading-6 text-[#666]">
              100% Natural ingredients.
            </div>
          </details>
        </section>
      </div>

      <section className="mt-12 min-w-0 overflow-hidden">
        <section>
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-2xl font-semibold">Recomended For You</h2>
            <Link
              to={`/category?cat=${encodeURIComponent(product.category || "all")}`}
              className="rounded-lg border border-[#b6349a] px-5 py-2.5 text-sm font-semibold text-[#b6349a]"
            >
              View All &rarr;
            </Link>
          </div>
          <Swiper
            slidesPerView={2}
            spaceBetween={20}
            breakpoints={{
              540: { slidesPerView: 3, spaceBetween: 20 },
              700: { slidesPerView: 4, spaceBetween: 30 },
              1024: { slidesPerView: 5, spaceBetween: 30 },
            }}
            className="min-w-0 !overflow-hidden"
          >
            {recommended.map((rec) => (
              <SwiperSlide key={rec.id}>
                <ProductCard product={rec} />
              </SwiperSlide>
            ))}
          </Swiper>
        </section>
      </section>
    </main>
  );
}
