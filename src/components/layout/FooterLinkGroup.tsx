import { Link } from "react-router-dom";
import { translate } from "../../features/i18n/LanguageContext";

export interface FooterLink {
  label: string;
  to: string;
}

interface FooterLinkGroupProps {
  title: string;
  links: FooterLink[];
  onNavigate?: () => void;
}

export default function FooterLinkGroup({ title, links, onNavigate }: FooterLinkGroupProps) {
  return (
    <div className="flex flex-col gap-1 [@media(max-width:768px)]:gap-1.5">
      <h2 className="text-[var(--text-primary)] [@media(max-width:768px)]:text-[14px] [@media(max-width:768px)]:font-semibold">{translate(title)}</h2>
      {links.map((link) => (
        <Link key={`${link.to}-${link.label}`} to={link.to} onClick={onNavigate} className="text-[var(--text-secondary)] [@media(max-width:768px)]:text-[12px] [@media(max-width:768px)]:leading-5">
          {translate(link.label)}
        </Link>
      ))}
    </div>
  );
}
