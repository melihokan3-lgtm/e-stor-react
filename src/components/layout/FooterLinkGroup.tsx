import { Link } from "react-router-dom";

export interface FooterLink {
  label: string;
  to: string;
}

interface FooterLinkGroupProps {
  title: string;
  links: FooterLink[];
}

export default function FooterLinkGroup({ title, links }: FooterLinkGroupProps) {
  return (
    <div className="flex flex-col gap-1">
      <h5 className="text-[var(--text-primary)]">{title}</h5>
      {links.map((link) => (
        <Link key={`${link.to}-${link.label}`} to={link.to} className="text-[var(--text-secondary)]">
          {link.label}
        </Link>
      ))}
    </div>
  );
}
