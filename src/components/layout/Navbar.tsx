import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect, useRef, type MouseEvent as ReactMouseEvent } from "react";
import { useCart } from "../../features/cart/CartContext";
import { useAuth } from "../../features/auth/AuthContext";
import { useLocation } from "../../features/addresses/LocationContext";
import AuthModal from "../common/AuthModal";
import LocationModal from "../common/LocationModal";
import { readUserStorage, writeUserStorage } from "../../utils/userStorage";

export default function Navbar() {
  const { totalItems } = useCart();
  const { user, isLoggedIn, openAuthModal } = useAuth();
  const { location, openLocationModal } = useLocation();
  const [searchTerm, setSearchTerm] = useState("");
  const [pastSearches, setPastSearches] = useState<string[]>([]);
  const [showPastSearches, setShowPastSearches] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement | null>(null);
  const navigate = useNavigate();

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
      <nav className="relative z-20 flex flex-wrap items-center justify-between gap-[15px] border-b border-[var(--border-light)] px-5 py-4 md:flex-nowrap md:justify-evenly md:px-0">
        <div className="order-1 flex w-auto items-center gap-4 md:w-[290px]">
          <Link to="/">
            <img src="/img/icon/logo2.svg" alt="E-Storee" />
          </Link>
          <button
            type="button"
            className="hidden cursor-pointer items-center gap-2 bg-transparent px-0 py-2 text-[13px] font-medium text-[#333] transition-colors hover:text-[#b6349a] md:flex"
            onClick={openLocationModal}
            aria-label={`Change delivery location. Current location: ${location}`}
            title={location}
          >
            <img src="/img/icon/Location.svg" alt="Location" />
            <p>{displayLocation}</p>
          </button>
        </div>

        <div className="order-2 md:order-3">
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
          <div className={menuOpen ? "absolute left-5 right-5 top-[84px] z-30 flex flex-col rounded-[18px] bg-white p-6 shadow-[0_12px_35px_rgba(0,0,0,0.15)] md:static md:flex md:bg-transparent md:p-0 md:shadow-none" : "hidden md:flex"}>
            <div className="flex w-full flex-col gap-6 rounded-[20px] bg-[#f8f7f8] p-4 md:w-[250px]">
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

        <div className="relative order-4 flex w-full items-center gap-2.5 rounded-[30px] bg-white px-4 py-2 shadow-[var(--shadow-md)] md:order-2 md:w-[40%]" ref={searchContainerRef}>
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

        <div className="order-3 ml-2 flex gap-5 md:ml-0">


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
                src={user.image}
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
