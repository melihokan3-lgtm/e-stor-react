import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer>
      <div className="footer__up">
        <Link to="/">
          <img src="/img/icon/Logo.svg" alt="E-Storee" />
        </Link>
        <div className="footer__link">
          <h5>About</h5>
          <Link to="/profile/help">About Us</Link>
          <Link to="/profile/help">Our Branches</Link>
          <Link to="/profile/help">Changelog</Link>
        </div>
        <div className="footer__link">
          <h5>Quick Links</h5>
          <Link to="/profile/help">FAQs</Link>
          <Link to="/category">Recipes</Link>
          <Link to="/profile/help">Contact Us</Link>
        </div>
        <div className="footer__link">
          <h5>Help & Support</h5>
          <Link to="/profile/settings">Terms of Privacy</Link>
          <Link to="/profile/settings">Privacy Policy</Link>
          <Link to="/profile/settings">Security</Link>
        </div>
        <div className="footer__link">
          <h5>Company</h5>
          <Link to="/profile/help">Blog</Link>
          <Link to="/profile/help">Contact</Link>
        </div>
        <div className="footer__link">
          <h5>Social</h5>
          <a href="https://facebook.com" target="_blank" rel="noopener noreferrer">Facebook</a>
          <a href="https://instagram.com" target="_blank" rel="noopener noreferrer">Instagram</a>
          <a href="https://twitter.com" target="_blank" rel="noopener noreferrer">X</a>
        </div>
      </div>
      <div className="footer__down">
        <p>All rights reserved. © 2024 EmaStudio</p>
      </div>
    </footer>
  );
}
