import type { MetadataRoute } from "next";
import { getProducts, getSellerProfiles, siteConfig } from "@/data/products";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const products = await getProducts();
  const sellers = await getSellerProfiles();
  const staticRoutes = [
    { route: "", priority: 1 },
    { route: "/search", priority: 0.9 },
    { route: "/users", priority: 0.85 },
    { route: "/login", priority: 0.75 },
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

  const sellerRoutes = sellers.map((seller) => ({
    url: `${siteConfig.url}/users/${seller.slug}`,
    lastModified: now,
    changeFrequency: "weekly" as const,
    priority: 0.8
  }));

  return [...staticRoutes, ...productRoutes, ...sellerRoutes];
}
