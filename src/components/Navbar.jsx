import { Link, useNavigate } from "react-router-dom";
import { useContext, useState } from "react";
import { CartContext } from "../context/CartContext";
import { AuthContext } from "../context/AuthContext";
import { useLocation } from "../context/LocationContext";
import AuthModal from "./AuthModal";
import LocationModal from "./LocationModal";

export default function Navbar() {
  const { totalItems } = useContext(CartContext);
  const { user, isLoggedIn, openAuthModal } = useContext(AuthContext);
  const { location, openLocationModal } = useLocation();
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();

  const handleSearch = () => {
    if (searchTerm) {
      navigate(`/search?filter=${encodeURIComponent(searchTerm)}`);
    }
  };

  const handlePriceFilter = (range) => {
    navigate(`/category?price=${range}`);
  };

  const handleLoginClick = (e) => {
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

        <div className="nav__center">
          <img src="/img/icon/Frame 28.svg" alt="Search" />
          <input
            type="text"
            placeholder="Search by"
            id="category__input"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          />
          <button id="search__Btn" onClick={handleSearch}>
            Ara
          </button>
        </div>

        <div className="nav__right">


          <Link to="/cart" className="shopping__cart">
            <div>
              <img src="/img/icon/Buy.svg" alt="Cart" />
              <p className="shopping__cart__img">{totalItems}</p>
            </div>
            <p>Cart</p>
          </Link>

          {isLoggedIn ? (
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
