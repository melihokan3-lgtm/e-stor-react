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
    <footer className="flex flex-col border-t border-[var(--border-light)] px-20 py-[60px] [@media(max-width:768px)]:px-4 [@media(max-width:768px)]:py-8 [@media(max-width:480px)]:px-3 [@media(max-width:480px)]:py-7">
      <div className="flex flex-col items-center">
        <Link to="/" className="mb-10 text-[var(--text-secondary)] [@media(max-width:768px)]:mb-6">
          <img src="/img/icon/Logo.svg" alt="E-Storee" width={50} height={50} className="[@media(max-width:480px)]:h-11 [@media(max-width:480px)]:w-11" />
        </Link>
        <div className="grid w-full grid-cols-5 items-start justify-items-center gap-8 text-center [@media(max-width:768px)]:grid-cols-2 [@media(max-width:768px)]:gap-x-6 [@media(max-width:768px)]:gap-y-7 [@media(max-width:768px)]:text-left [@media(max-width:480px)]:gap-x-4 [@media(max-width:480px)]:gap-y-6">
          {footerGroups.map((group) => <FooterLinkGroup key={group.title} {...group} />)}
          <div className="flex flex-col items-center gap-4 text-center [@media(max-width:768px)]:col-span-2 [@media(max-width:768px)]:w-full [@media(max-width:768px)]:gap-2.5">
            <h2 className="text-[var(--text-primary)] [@media(max-width:768px)]:text-[14px] [@media(max-width:768px)]:font-semibold">Social</h2>
            {socialLinks.map((link) => (
              <a key={link.label} href={link.href} target="_blank" rel="noopener noreferrer" className="text-[var(--text-secondary)] [@media(max-width:768px)]:text-[12px]">
                {link.label}
              </a>
            ))}
          </div>
        </div>
      </div>
      <div className="pt-8 text-center [@media(max-width:768px)]:pt-6">
        <p className="text-[var(--text-secondary)] [@media(max-width:768px)]:text-[11px] [@media(max-width:768px)]:leading-5">All rights reserved. © 2024 EmaStudio</p>
      </div>
    </footer>
  );
}
