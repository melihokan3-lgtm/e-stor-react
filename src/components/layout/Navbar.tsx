import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect, useRef, type MouseEvent as ReactMouseEvent } from "react";
import { useCart } from "../../features/cart/CartContext";
import { useAuth } from "../../features/auth/AuthContext";
import { useLocation } from "../../features/addresses/LocationContext";
import AuthModal from "../common/AuthModal";
import LocationModal from "../common/LocationModal";
import { readUserStorage, writeUserStorage } from "../../utils/userStorage";
import useProducts from "../../features/products/useProducts";

export default function Navbar() {
  const { products } = useProducts();
  const { totalItems } = useCart();
  const { user, isLoggedIn, openAuthModal } = useAuth();
  const { location, openLocationModal } = useLocation();
  const [searchTerm, setSearchTerm] = useState("");
  const [pastSearches, setPastSearches] = useState<string[]>([]);
  const [showPastSearches, setShowPastSearches] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [categoriesOpen, setCategoriesOpen] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const categoriesRef = useRef<HTMLDivElement | null>(null);
  const navigate = useNavigate();
  const avatarSrc = user?.image?.trim() || "https://ui-avatars.com/api/?name=User&background=b6349a&color=fff";
  const navbarCategories = Array.from(
    new Set(products.map((product) => product.category?.trim()).filter((category): category is string => Boolean(category))),
  ).map((category) => ({ label: category, query: category }));

  useEffect(() => {
    setPastSearches(readUserStorage<string[]>("pastSearches", user, []));
  }, [user]);

  useEffect(() => {
    const handleClickOutside = (event: globalThis.MouseEvent): void => {
      if (searchContainerRef.current && !(event.target instanceof Node && searchContainerRef.current.contains(event.target))) {
        setShowPastSearches(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const handleMenuOutsideClick = (event: globalThis.MouseEvent): void => {
      if (menuOpen && menuRef.current && !(event.target instanceof Node && menuRef.current.contains(event.target))) {
        setMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleMenuOutsideClick);
    return () => document.removeEventListener("mousedown", handleMenuOutsideClick);
  }, [menuOpen]);

  useEffect(() => {
    const handleCategoriesOutsideClick = (event: globalThis.MouseEvent): void => {
      if (categoriesOpen && categoriesRef.current && !(event.target instanceof Node && categoriesRef.current.contains(event.target))) {
        setCategoriesOpen(false);
      }
    };

    document.addEventListener("mousedown", handleCategoriesOutsideClick);
    return () => document.removeEventListener("mousedown", handleCategoriesOutsideClick);
  }, [categoriesOpen]);

  const handleSearch = (termToSearch: string = searchTerm): void => {
    if (termToSearch) {
      const updatedSearches = [termToSearch, ...pastSearches.filter(s => s !== termToSearch)].slice(0, 5);
      setPastSearches(updatedSearches);
      writeUserStorage("pastSearches", user, updatedSearches);
      setShowPastSearches(false);
      navigate(`/search?filter=${encodeURIComponent(termToSearch)}`);
    }
  };

  const handleRemoveSearch = (e: ReactMouseEvent<HTMLButtonElement>, searchToRemove: string): void => {
    e.stopPropagation();
    const updatedSearches = pastSearches.filter(s => s !== searchToRemove);
    setPastSearches(updatedSearches);
    writeUserStorage("pastSearches", user, updatedSearches);
  };


  const handlePriceFilter = (range: string): void => {
    navigate(`/category?price=${range}`);
  };

  const handleLoginClick = (e: ReactMouseEvent<HTMLButtonElement>): void => {
    e.preventDefault();
    if (isLoggedIn) {
      navigate("/profile/details");
    } else {
      openAuthModal();
    }
  };

  const displayLocation = location
    ? location.trim().split(/\s+/).slice(0, 2).join(" ")
    : "";

  return (
    <>
      <nav className="relative z-20 flex flex-wrap items-center justify-between gap-[15px] border-b border-[var(--border-light)] px-5 py-4 md:flex-nowrap md:justify-start md:px-5">
        <div className="order-1 flex w-auto items-center gap-4 md:w-auto">
          <Link to="/">
            <img src="/img/icon/logo2.svg" alt="E-Storee" />
          </Link>
        </div>

        <div className="relative order-2 hidden md:ml-2 md:block" ref={categoriesRef}>
          <button
            type="button"
            onClick={() => setCategoriesOpen((open) => !open)}
            className="flex items-center gap-2 rounded-[22px] px-3 py-2 text-sm font-semibold text-[#333] transition hover:bg-[#fff5fc] hover:text-[#b6349a]"
            aria-expanded={categoriesOpen}
            aria-haspopup="menu"
          >
            <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M4 6h16M4 12h16M4 18h16" />
            </svg>
            <span>Categories</span>
            <span className={`text-xs transition-transform ${categoriesOpen ? "rotate-180" : ""}`}>⌄</span>
          </button>
          {categoriesOpen && (
            <div className="absolute left-0 top-[calc(100%+12px)] z-40 grid w-[420px] grid-cols-2 gap-1 rounded-2xl border border-[#eee] bg-white p-3 shadow-[0_16px_35px_rgba(0,0,0,0.14)]" role="menu">
              {navbarCategories.map((category) => (
                <Link
                  key={category.query}
                  to={`/category?cat=${encodeURIComponent(category.query)}`}
                  onClick={() => setCategoriesOpen(false)}
                  className="rounded-xl px-3 py-3 text-sm font-medium text-[#444] transition hover:bg-[#fff5fc] hover:text-[#b6349a]"
                  role="menuitem"
                >
                  {category.label}
                </Link>
              ))}
              <Link to="/category" onClick={() => setCategoriesOpen(false)} className="col-span-2 mt-1 border-t border-[#eee] px-3 pt-3 text-sm font-bold text-[#b6349a]">View all categories →</Link>
            </div>
          )}
        </div>

        <div className="order-2 md:order-3" ref={menuRef}>
          <label
            className="flex cursor-pointer flex-col gap-1.5 p-2 md:hidden"
            aria-label="Open menu or close menu"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((open) => !open)}
          >
            <span className="h-0.5 w-6 bg-[#333]"></span>
            <span className="h-0.5 w-6 bg-[#333]"></span>
            <span className="h-0.5 w-6 bg-[#333]"></span>
          </label>
          <div className={menuOpen ? "absolute left-5 right-5 top-[84px] z-30 flex max-h-[calc(100vh-100px)] flex-col gap-4 overflow-y-auto rounded-[18px] bg-white p-4 shadow-[0_12px_35px_rgba(0,0,0,0.15)] md:hidden" : "hidden"}>
            <div className="grid grid-cols-2 gap-3 border-b border-[#eee] pb-4">
              <Link to="/cart" onClick={() => setMenuOpen(false)} className="flex min-h-[72px] flex-col items-center justify-center gap-2 rounded-[14px] bg-[#fef5fd] text-sm font-semibold text-[#333] transition hover:bg-[#fbe8f7]">
                <span className="relative">
                  <img src="/img/icon/Buy.svg" alt="" className="h-6 w-6" />
                  <span className="absolute -right-3 -top-2 text-[11px] font-bold text-[#b6349a]">{totalItems}</span>
                </span>
                <span>Cart</span>
              </Link>
              {isLoggedIn && user ? (
                <Link to="/profile/details" onClick={() => setMenuOpen(false)} className="flex min-h-[72px] flex-col items-center justify-center gap-2 rounded-[14px] bg-[#f8f7f8] text-sm font-semibold text-[#333] transition hover:bg-[#f1edf1]">
                  <img src={avatarSrc} alt="" className="h-7 w-7 rounded-full object-cover" />
                  <span>My Account</span>
                </Link>
              ) : (
                <button type="button" onClick={() => { setMenuOpen(false); openAuthModal(); }} className="flex min-h-[72px] flex-col items-center justify-center gap-2 rounded-[14px] border border-[#d73f98] bg-white text-sm font-semibold text-[#333] transition hover:bg-[#fff5fc]">
                  <img src="/img/icon/2 User.svg" alt="" className="h-6 w-6" />
                  <span>Login</span>
                </button>
              )}
            </div>

            <button type="button" onClick={() => { setMenuOpen(false); openLocationModal(); }} className="flex items-center gap-3 rounded-[14px] border border-[#eee] px-4 py-3 text-left text-sm font-medium text-[#333] transition hover:border-[#b6349a] hover:text-[#b6349a]">
              <img src="/img/icon/Location.svg" alt="" className="h-5 w-5" />
              <span className="min-w-0 flex-1 truncate">{displayLocation || "Select delivery location"}</span>
              <span aria-hidden="true">›</span>
            </button>

            <div className="rounded-[14px] border border-[#eee] bg-white p-4">
              <div className="mb-3 flex items-center justify-between">
                <h3 className="text-sm font-bold text-[#222]">Categories</h3>
                <Link to="/category" onClick={() => setMenuOpen(false)} className="text-xs font-bold text-[#b6349a]">View all</Link>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {navbarCategories.map((category) => (
                  <Link key={category.query} to={`/category?cat=${encodeURIComponent(category.query)}`} onClick={() => setMenuOpen(false)} className="rounded-lg bg-[#faf9fa] px-3 py-2.5 text-xs font-medium text-[#444] transition hover:bg-[#fff0fa] hover:text-[#b6349a]">
                    {category.label}
                  </Link>
                ))}
              </div>
            </div>

            <div className="flex w-full flex-col gap-6 rounded-[14px] bg-[#f8f7f8] p-4">
              <h3 className="text-base font-semibold text-[#222]">Filters</h3>
              <div className="flex flex-col gap-3">
                <h4 className="text-sm font-semibold text-[#222]">Price</h4>
                <label className="flex cursor-pointer items-center gap-2 text-sm font-bold text-[#555]">
                    <input
                      className="peer sr-only"
                      value="0-50"
                      type="radio"
                      name="grup__price"
                      onChange={(e) => handlePriceFilter(e.target.value)}
                    />
                    <span className="relative inline-block h-[34px] w-[60px] rounded-[34px] bg-[#ccc] transition-colors peer-checked:bg-[#a0cfc1] peer-focus-visible:ring-2 peer-focus-visible:ring-[#a0cfc1] before:absolute before:bottom-1 before:left-1 before:h-[26px] before:w-[26px] before:rounded-full before:bg-white before:transition-transform peer-checked:before:translate-x-[26px]"></span>
                    <span>Under $50</span>
                </label>
                <label className="flex cursor-pointer items-center gap-2 text-sm font-bold text-[#555]">
                    <input
                      className="peer sr-only"
                      value="50-100"
                      type="radio"
                      name="grup__price"
                      onChange={(e) => handlePriceFilter(e.target.value)}
                    />
                    <span className="relative inline-block h-[34px] w-[60px] rounded-[34px] bg-[#ccc] transition-colors peer-checked:bg-[#a0cfc1] peer-focus-visible:ring-2 peer-focus-visible:ring-[#a0cfc1] before:absolute before:bottom-1 before:left-1 before:h-[26px] before:w-[26px] before:rounded-full before:bg-white before:transition-transform peer-checked:before:translate-x-[26px]"></span>
                    <span>$50 - $100</span>
                </label>
                <label className="flex cursor-pointer items-center gap-2 text-sm font-bold text-[#555]">
                    <input
                      className="peer sr-only"
                      value="100-10000"
                      type="radio"
                      name="grup__price"
                      onChange={(e) => handlePriceFilter(e.target.value)}
                    />
                    <span className="relative inline-block h-[34px] w-[60px] rounded-[34px] bg-[#ccc] transition-colors peer-checked:bg-[#a0cfc1] peer-focus-visible:ring-2 peer-focus-visible:ring-[#a0cfc1] before:absolute before:bottom-1 before:left-1 before:h-[26px] before:w-[26px] before:rounded-full before:bg-white before:transition-transform peer-checked:before:translate-x-[26px]"></span>
                    <span>Over $100</span>
                </label>
              </div>
            </div>
          </div>
        </div>

        <div className="relative order-4 flex w-full items-center gap-2.5 rounded-[30px] bg-white px-4 py-2 shadow-[var(--shadow-md)] md:absolute md:left-1/2 md:top-1/2 md:order-2 md:ml-0 md:w-[40%] md:-translate-x-1/2 md:-translate-y-1/2" ref={searchContainerRef}>
          <img src="/img/icon/Frame 28.svg" alt="Search" />
          <input
            type="text"
            placeholder="Search products..."
            id="category__input"
            className="min-w-0 flex-1 border-0 bg-transparent text-sm outline-none"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onFocus={() => setShowPastSearches(true)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          />
          <button className="rounded-[20px] bg-[#d73f98] px-4 py-1.5 text-[13px] font-semibold text-white transition hover:opacity-90" onClick={() => handleSearch()}>
            Search
          </button>
          
          {showPastSearches && pastSearches.length > 0 && (
            <div className="absolute left-0 top-[calc(100%+8px)] z-30 w-full overflow-hidden rounded-2xl border border-[#e5e7eb] bg-white py-2 shadow-[0_10px_25px_rgba(0,0,0,0.1)]">
              <ul className="m-0 list-none p-0">
                {pastSearches.map((search) => (
                  <li className="flex cursor-pointer items-center justify-between px-4 py-2 text-sm hover:bg-[#fff5fc]" key={search} onClick={() => { setSearchTerm(search); handleSearch(search); }}>
                    <div className="flex items-center gap-2">
                      <img src="/img/icon/Frame 28.svg" alt="Search" className="h-4 w-4" />
                      <span>{search}</span>
                    </div>
                    <button 
                      className="border-0 bg-transparent px-2 text-lg text-[#999] hover:text-[#d73f98]"
                      onClick={(e) => handleRemoveSearch(e, search)}
                      aria-label="Remove search"
                    >
                      &times;
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <div className="order-3 ml-2 hidden items-center gap-4 md:ml-auto md:mr-0 md:flex">

          <button
            type="button"
            className="flex cursor-pointer items-center gap-2 bg-transparent px-0 py-2 text-[13px] font-medium text-[#333] transition-colors hover:text-[#b6349a]"
            onClick={openLocationModal}
            aria-label={`Change delivery location. Current location: ${location}`}
            title={location}
          >
            <img src="/img/icon/Location.svg" alt="Location" />
            <p>{displayLocation}</p>
          </button>


          <Link to="/cart" className="flex items-center justify-center gap-2 rounded-[30px] bg-[#fef5fd] px-5 py-2.5 text-center font-medium">
            <div className="relative flex items-center">
              <img src="/img/icon/Buy.svg" alt="Cart" className="h-5 w-5" />
              <p className="absolute -right-2 -top-2 text-[11px] text-[#d73f98]">{totalItems}</p>
            </div>
            <p>Cart</p>
          </Link>

          {isLoggedIn && user ? (
            <Link to="/profile/details" className="flex items-center gap-2 text-sm font-medium text-[#333]">
              <img
                src={avatarSrc}
                alt={user.firstName}
                className="h-8 w-8 rounded-full object-cover"
              />
              <span className="hidden md:inline">
                Merhaba, {user.firstName}
              </span>
            </Link>
          ) : (
            <button className="flex items-center gap-2 rounded-[22px] border border-[#d73f98] bg-white px-5 py-2 text-sm font-medium text-[#333] transition hover:bg-[#fff5fc]" onClick={handleLoginClick}>
              <img src="/img/icon/2 User.svg" alt="Login" />
              <p>Login</p>
            </button>
          )}
        </div>
      </nav>

      {/* Auth Modal — rendered globally */}
      <AuthModal />
      <LocationModal />
    </>
  );
}
