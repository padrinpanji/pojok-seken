import type { MetadataRoute } from "next";
import { products, siteConfig } from "@/data/products";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const staticRoutes = [
    { route: "", priority: 1 },
    { route: "/search", priority: 0.9 },
    { route: "/about", priority: 0.8 },
    { route: "/contact", priority: 0.8 },
    { route: "/about-contact", priority: 0.7 },
    { route: "/terms-and-conditions", priority: 0.7 },
    { route: "/terms", priority: 0.6 },
    { route: "/term-and-condition", priority: 0.6 }
  ].map(({ route, priority }) => ({
    url: `${siteConfig.url}${route}`,
    lastModified: now,
    changeFrequency: "weekly" as const,
    priority
  }));

  const productRoutes = products.map((product) => ({
    url: `${siteConfig.url}/products/${product.slug}`,
    lastModified: now,
    changeFrequency: "weekly" as const,
    priority: 0.9
  }));

  return [...staticRoutes, ...productRoutes];
}
