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
    <footer className="flex flex-col border-t border-[var(--border-light)] px-20 py-[60px] [@media(max-width:768px)]:px-5 [@media(max-width:768px)]:py-[30px]">
      <div className="flex flex-col items-center">
        <Link to="/" className="mb-10 text-[var(--text-secondary)]">
          <img src="/img/icon/Logo.svg" alt="E-Storee" />
        </Link>
        <div className="grid w-full grid-cols-5 items-start justify-items-center gap-8 text-center [@media(max-width:768px)]:grid-cols-2 [@media(max-width:768px)]:gap-x-5 [@media(max-width:768px)]:gap-y-8 [@media(max-width:768px)]:text-left">
          {footerGroups.map((group) => <FooterLinkGroup key={group.title} {...group} />)}
          <div className="flex flex-col items-center gap-4 text-center [@media(max-width:768px)]:w-full">
            <h5 className="text-[var(--text-primary)]">Social</h5>
            {socialLinks.map((link) => (
              <a key={link.label} href={link.href} target="_blank" rel="noopener noreferrer" className="text-[var(--text-secondary)]">
                {link.label}
              </a>
            ))}
          </div>
        </div>
      </div>
      <div className="pt-8 text-center">
        <p>All rights reserved. © 2024 EmaStudio</p>
      </div>
    </footer>
  );
}
