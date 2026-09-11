export default function Footer() {
  return (
    <footer>
      <div className="footer__up">
        <img src="/img/icon/Logo.svg" alt="E-Storee" />
        <div className="footer__link">
          <a href="#">
            <h5>About</h5>
          </a>
          <a href="#">About Us</a>
          <a href="#">Our Branches</a>
          <a href="#">Changelog</a>
        </div>
        <div className="footer__link">
          <a href="#">
            <h5>Quick Links</h5>
          </a>
          <a href="#">FAQs</a>
          <a href="#">Recipes</a>
          <a href="#">Contact Us</a>
        </div>
        <div className="footer__link">
          <a href="#">
            <h5>Help & Support</h5>
          </a>
          <a href="#">Terms of Privacy</a>
          <a href="#">Privacy Policy</a>
          <a href="#">Security</a>
        </div>
        <div className="footer__link">
          <a href="#">
            <h5>Company</h5>
          </a>
          <a href="#">Blog</a>
          <a href="#">Contact</a>
        </div>
        <div className="footer__link">
          <a href="#">
            <h5>Social</h5>
          </a>
          <a href="#">Facebook</a>
          <a href="#">Instagram</a>
          <a href="#">X</a>
        </div>
      </div>
      <div className="footer__down">
        <p>All rights reserved. © 2024 EmaStudio</p>
      </div>
    </footer>
  );
}
