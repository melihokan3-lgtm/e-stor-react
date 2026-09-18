import { useEffect } from "react";

export interface SeoMetaProps {
  title: string;
  description: string;
  canonicalPath: string;
  robots?: "index,follow" | "noindex,nofollow";
  structuredData?: Record<string, unknown>;
}

const SITE_URL = "https://e-stor-react-nttt.vercel.app";

function setMeta(attribute: "name" | "property", key: string, content: string) {
  let element = document.head.querySelector<HTMLMetaElement>(`meta[${attribute}="${key}"]`);
  if (!element) {
    element = document.createElement("meta");
    element.setAttribute(attribute, key);
    document.head.appendChild(element);
  }
  element.content = content;
}

function setCanonical(url: string) {
  let element = document.head.querySelector<HTMLLinkElement>("link[rel=canonical]");
  if (!element) {
    element = document.createElement("link");
    element.rel = "canonical";
    document.head.appendChild(element);
  }
  element.href = url;
}

export default function SeoMeta({ title, description, canonicalPath, robots = "index,follow", structuredData }: SeoMetaProps) {
  useEffect(() => {
    const canonicalUrl = `${SITE_URL}${canonicalPath}`;

    document.title = title;
    setMeta("name", "description", description);
    setMeta("name", "robots", robots);
    setMeta("property", "og:title", title);
    setMeta("property", "og:description", description);
    setMeta("property", "og:url", canonicalUrl);
    setMeta("name", "twitter:title", title);
    setMeta("name", "twitter:description", description);
    setCanonical(canonicalUrl);

    const scriptId = "seo-structured-data";
    const previousScript = document.getElementById(scriptId);
    previousScript?.remove();
    if (structuredData) {
      const script = document.createElement("script");
      script.id = scriptId;
      script.type = "application/ld+json";
      script.textContent = JSON.stringify(structuredData);
      document.head.appendChild(script);
    }

    return () => document.getElementById(scriptId)?.remove();
  }, [canonicalPath, description, robots, structuredData, title]);

  return null;
}
