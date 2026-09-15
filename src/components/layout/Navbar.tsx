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
      <nav className="navbar">
        <div className="nav__left">
          <Link to="/">
            <img src="/img/icon/logo2.svg" alt="E-Storee" />
          </Link>
          <button
            type="button"
            className="nav__left__location"
            onClick={openLocationModal}
            aria-label={`Change delivery location. Current location: ${location}`}
            title={location}
          >
            <img src="/img/icon/Location.svg" alt="Location" />
            <p>{displayLocation}</p>
          </button>
        </div>

        <div className="menu">
          <input type="checkbox" id="menu-state" className="css-toggle" />
          <label
            htmlFor="menu-state"
            className="menu-toggle"
            aria-label="Open menu or close menu"
            aria-expanded="false"
          >
            <span></span>
            <span></span>
            <span></span>
          </label>
          <div className="main-nav">
            <div className="filters__area">
              <h3>Filters</h3>
              <div className="filter__group">
                <h4>Price</h4>
                <div className="filter__selected">
                  <label className="switch switch__price">
                    <input
                      value="0-50"
                      type="radio"
                      name="grup__price"
                      onChange={(e) => handlePriceFilter(e.target.value)}
                    />
                    <span className="slider round"></span>
                  </label>
                  <h4>Under $50</h4>
                </div>
                <div className="filter__selected">
                  <label className="switch switch__price">
                    <input
                      value="50-100"
                      type="radio"
                      name="grup__price"
                      onChange={(e) => handlePriceFilter(e.target.value)}
                    />
                    <span className="slider round"></span>
                  </label>
                  <h4>$50 - $100</h4>
                </div>
                <div className="filter__selected">
                  <label className="switch switch__price">
                    <input
                      value="100-10000"
                      type="radio"
                      name="grup__price"
                      onChange={(e) => handlePriceFilter(e.target.value)}
                    />
                    <span className="slider round"></span>
                  </label>
                  <h4>Over $100</h4>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="nav__center" ref={searchContainerRef}>
          <img src="/img/icon/Frame 28.svg" alt="Search" />
          <input
            type="text"
            placeholder="Search products..."
            id="category__input"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onFocus={() => setShowPastSearches(true)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          />
          <button id="search__Btn" onClick={() => handleSearch()}>
            Search
          </button>
          
          {showPastSearches && pastSearches.length > 0 && (
            <div className="past-searches-dropdown">
              <ul>
                {pastSearches.map((search) => (
                  <li key={search} onClick={() => { setSearchTerm(search); handleSearch(search); }}>
                    <div className="search-text">
                      <img src="/img/icon/Frame 28.svg" alt="Search" className="past-search-icon" />
                      <span>{search}</span>
                    </div>
                    <button 
                      className="remove-search-btn"
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

        <div className="nav__right">


          <Link to="/cart" className="shopping__cart">
            <div>
              <img src="/img/icon/Buy.svg" alt="Cart" />
              <p className="shopping__cart__img">{totalItems}</p>
            </div>
            <p>Cart</p>
          </Link>

          {isLoggedIn && user ? (
            <Link to="/profile/details" className="nav-user-greeting">
              <img
                src={user.image}
                alt={user.firstName}
                className="nav-user-avatar"
              />
              <span className="nav-user-name">
                Merhaba, {user.firstName}
              </span>
            </Link>
          ) : (
            <button className="nav__right__login" onClick={handleLoginClick}>
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
