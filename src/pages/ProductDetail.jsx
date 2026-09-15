import { useState, useEffect, useContext } from "react";
import { useParams, Link } from "react-router-dom";
import { Swiper, SwiperSlide } from "swiper/react";
import {
  fetchProductById,
  fetchProducts,
  cleanImageUrl,
  FALLBACK_IMG,
} from "../services/api";
import { CartContext } from "../context/CartContext";
import { AuthContext } from "../context/AuthContext";
import { readUserStorage } from "../utils/userStorage";
import ProductCard from "../components/product/ProductCard";

const StarIcon = ({ filled = true, width = 14, height = 14 }) => (
  <svg width={width} height={height} viewBox="0 0 24 24" fill={filled ? "#ffc107" : "none"} stroke={filled ? "#ffc107" : "#ddd"} strokeWidth="2" xmlns="http://www.w3.org/0000/svg">
    <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

export default function ProductDetail() {
  const { categorySlug, productId } = useParams();
  const { addToCart } = useContext(CartContext);
  const { user } = useContext(AuthContext);
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [activeImgIndex, setActiveImgIndex] = useState(0);

  const [recommended, setRecommended] = useState([]);

  useEffect(() => {
    window.scrollTo(0, 0);
    setLoading(true);
    setError(false);

    fetchProductById(productId)
      .then((data) => {
        if (!data || data.length === 0 || Object.keys(data).length === 0) {
          return fetchProducts().then((all) => {
            const found = all.find(
              (p) =>
                p.id.toString() === productId ||
                p.title?.toLowerCase().replace(/\s+/g, "-") === productId,
            );
            if (found) {
              setProduct(found);
            } else {
              // Fallback: The product might be in the cart (localStorage) but removed from API
              const localCart = readUserStorage("cart", user, []);
              const cartFound = localCart.find(
                (item) =>
                  item.data.id.toString() === productId ||
                  item.data.title?.toLowerCase().replace(/\s+/g, "-") === productId
              );
              if (cartFound) {
                setProduct(cartFound.data);
              } else {
                setError(true);
              }
            }
          });
        } else {
          setProduct(Array.isArray(data) ? data[0] : data);
        }
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));

    fetchProducts().then((all) => {
      setRecommended(all.slice(0, 10));
    });
  }, [productId, user]);

  if (loading)
    return (
      <main>
        <div className="category__container__div">
          <p>Loading product details...</p>
        </div>
      </main>
    );
  if (error || !product)
    return (
      <main>
        <div className="category__container__div">
          <p>Product not found.</p>
        </div>
      </main>
    );

  const images = product.image ? [product.image] : (product.images || []);
  const mainImg =
    images.length > 0 ? cleanImageUrl(images[activeImgIndex]) : FALLBACK_IMG;

  return (
    <main id="main__details">
      <section className="details__link">
        <Link to="/"> Home &gt; &nbsp; </Link>
        <Link to="/category"> Settings &gt; &nbsp; </Link>
        <p style={{ color: "#b6349a" }}> Team </p>
      </section>

      <div className="details-container">
        <div className="details__prodocts">
          <div className="images__area" >
            <img
              src={mainImg}
              alt={product.title}
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = FALLBACK_IMG;
              }}
            />
            <div className="image__area">
              {images.map((imgUrl, idx) => (
                <img
                  key={`${imgUrl}-${idx}`}
                  src={cleanImageUrl(imgUrl)}
                  alt=""
                  onClick={() => setActiveImgIndex(idx)}
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = FALLBACK_IMG;
                  }}
                  style={{
                    cursor: "pointer",
                    border:
                      activeImgIndex === idx
                        ? "2px solid #b6349a"
                        : "1px solid transparent",
                    borderRadius: "16px",
                    padding: "4px",
                  }}
                />
              ))}
            </div>
          </div>

          <div className="products__description">
            <div className="product__description">
              <h2
                className="product__description__title"
                style={{ color: "#000", fontWeight: "bold" }}
              >
                {product.title}
              </h2>
              {product.description && (
                <p style={{ color: "#555", marginTop: "12px", marginBottom: "16px", lineHeight: "1.5" }}>
                  {product.description}
                </p>
              )}
              <div className="product__description__prices">
                <p style={{ color: "#888", marginBottom: "8px", fontSize: "14px" }}>$2.71/lb</p>
                <div
                  style={{ display: "flex", alignItems: "center", gap: "10px" }}
                >
                  <h3
                    className="product__description__mony"
                    style={{
                      fontSize: "32px",
                      fontWeight: "bold",
                      color: "#000",
                    }}
                  >
                    ${product.price}
                  </h3>
                  <span
                    style={{
                      textDecoration: "line-through",
                      color: "#888",
                      fontSize: "18px",
                    }}
                  >
                    $99.99
                  </span>
                </div>
                <p
                  style={{
                    color: "#b6349a",
                    fontWeight: "bold",
                    marginTop: "8px",
                    fontSize: "14px",
                  }}
                >
                  12 Left
                </p>
              </div>
            </div>

            <button
              className="products__description__button"
              onClick={() => addToCart(product)}
            >
              <svg
                className="products__description__button__svg"
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

            <div className="about__product">
              <h3 className="about__product__title">About Product</h3>
              <div className="about__product__item">
                <div className="about__product__icon about__product__icon--pink">
                  🏆
                </div>
                <p className="about__product__text">Best Seller Product</p>
                <a href="#" className="about__product__link">
                  View More &gt;
                </a>
              </div>
              <div className="about__product__item">
                <div className="about__product__icon about__product__icon--green">
                  ✔
                </div>
                <p className="about__product__text">
                  100% satisfaction guarantee
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* CUSTOMER REVIEWS SECTION */}
        <section className="customer-reviews-section">
          <div className="customer-reviews-grid">
            <div className="reviews-summary">
              <h3 style={{ fontSize: "24px", marginBottom: "10px" }}>Customer Reviews</h3>
              <p className="average-rating">Average rating: 4.5 (5391)</p>
              <div className="rating-bars">
                {[5, 4, 3, 2, 1].map((star) => (
                  <div key={star} className="rating-bar-row">
                    <span className="star-label">{star} <StarIcon filled={false} /></span>
                    <div className="progress-bar-bg">
                      <div className="progress-bar-fill" style={{ width: `${star * 20}%` }}></div>
                    </div>
                    <span className="rating-count">4.28K</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="reviews-list">
              <details className="reviews-list-details" open>
                <summary className="reviews-header">
                  <h3>Reviews</h3>
                  <span className="recent-filter">Recent</span>
                </summary>
                
                <div className="review-items-container">
                  <div className="review-item">
                    <h4>Perfect Combination!!</h4>
                    <div className="review-stars">
                      <StarIcon/><StarIcon/><StarIcon/><StarIcon/><StarIcon filled={false}/>
                    </div>
                    <p>This review was collected as part of a promotion.) I forgot to post my photos from my review! So here is my review again. A perfect combination of softness, strength, and proper friction to make any user leaving clean and spotless!! I have been purchasing for years and Angel Soft isn't too thick where you think you are using a towel and it's not too thin leaving you with unexpected tears during use!! Some say I have an addition to Angel Soft, I say it's dedication for a great product!! See the attached photos from my last purchase!</p>
                  </div>

                  <div className="review-item">
                    <h4>Perfect Combination!!</h4>
                    <div className="review-stars">
                      <StarIcon/><StarIcon/><StarIcon/><StarIcon/><StarIcon filled={false}/>
                    </div>
                    <p>This review was collected as part of a promotion.) I forgot to post my photos from my review! So here is my review again. A perfect combination of softness, strength, and proper friction to make any user leaving clean and spotless!! I have been purchasing for years and Angel Soft isn't too thick where you think you are using a towel and it's not too thin leaving you with unexpected tears during use!! Some say I have an addition to Angel Soft, I say it's dedication for a great product!! See the attached photos from my last purchase!</p>
                  </div>
                </div>
              </details>
            </div>
          </div>
        </section>

        {/* ACCORDION SECTION */}
        <section className="product-accordions">
          <details open>
            <summary>Details</summary>
            <div className="accordion-content">
              {product.description || "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua."}
            </div>
          </details>
          <details>
            <summary>Conservation and storage</summary>
            <div className="accordion-content">
              Store in a cool, dry place. Keep away from direct sunlight.
            </div>
          </details>
          <details>
            <summary>Ingredients</summary>
            <div className="accordion-content">
              100% Natural ingredients.
            </div>
          </details>
        </section>

      </div>

      <section className="product__area" style={{ marginTop: "50px" }}>
        <section className="home__section">
          <div className="home__section__header">
            <h2>Recomended For You</h2>
            <Link 
              to={`/category?cat=${typeof product?.category === 'string' ? product.category : (product?.category?.slug || product?.category?.name || 'all')}`} 
              className="view__all__btn" 
              style={{ padding: "10px 20px", display: "inline-block" }}
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
            className="mySwiper__recomended"
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
