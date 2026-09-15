import { Link } from "react-router-dom";
import FooterLinkGroup, { type FooterLink } from "./FooterLinkGroup";

const footerGroups: Array<{ title: string; links: FooterLink[] }> = [
  {
    title: "About",
    links: [
      { label: "About Us", to: "/profile/help" },
      { label: "Our Branches", to: "/profile/help" },
      { label: "Changelog", to: "/profile/help" },
    ],
  },
  {
    title: "Quick Links",
    links: [
      { label: "FAQs", to: "/profile/help" },
      { label: "Recipes", to: "/category" },
      { label: "Contact Us", to: "/profile/help" },
    ],
  },
  {
    title: "Help & Support",
    links: [
      { label: "Terms of Privacy", to: "/profile/settings" },
      { label: "Privacy Policy", to: "/profile/settings" },
      { label: "Security", to: "/profile/settings" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "Blog", to: "/profile/help" },
      { label: "Contact", to: "/profile/help" },
    ],
  },
];

const socialLinks = [
  { label: "Facebook", href: "https://facebook.com" },
  { label: "Instagram", href: "https://instagram.com" },
  { label: "X", href: "https://twitter.com" },
];

export default function Footer() {
  return (
    <footer>
      <div className="footer__up">
        <Link to="/">
          <img src="/img/icon/Logo.svg" alt="E-Storee" />
        </Link>
        {footerGroups.map((group) => <FooterLinkGroup key={group.title} {...group} />)}
        <div className="flex flex-col gap-4">
          <h5>Social</h5>
          {socialLinks.map((link) => (
            <a key={link.label} href={link.href} target="_blank" rel="noopener noreferrer">
              {link.label}
            </a>
          ))}
        </div>
      </div>
      <div className="pt-8 text-center">
        <p>All rights reserved. © 2024 EmaStudio</p>
      </div>
    </footer>
  );
}
