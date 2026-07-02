import type { Metadata } from "next";
import { type Product } from "@/data/products";

export const LOCATION_SLUG_PREFIX = "barang-seken-di-";
export const ALL_CATEGORY_SLUG = "all";
export const SEARCH_SEO_YEAR = new Date().getFullYear();

export const SEARCH_KEYWORDS = [
  "barang bekas",
  "barang seken",
  "jual beli barang bekas",
  "marketplace barang seken",
  "produk bekas berkualitas",
  "Pojok Seken",
];

export type ProductFilters = {
  q: string[];
  category: string;
  condition: string;
  locations: string[];
  sort: string;
  minPrice?: number;
  maxPrice?: number;
  minYear: string;
  verified: boolean;
};

export function getSingleParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] || "" : value || "";
}

export function getArrayParam(value: string | string[] | undefined) {
  return [...new Set((Array.isArray(value) ? value : [value]).filter((item): item is string => !!item))];
}

export function getNumberParam(value: string | string[] | undefined) {
  const number = Number(getSingleParam(value));
  return Number.isFinite(number) && number > 0 ? number : undefined;
}

export function hasSearchFilters(params?: Record<string, string | string[] | undefined>) {
  return Object.values(params || {}).some((value) => {
    if (Array.isArray(value)) return value.some(Boolean);

    return Boolean(value);
  });
}

export function getSearchRobots(shouldIndex: boolean): Metadata["robots"] {
  if (!shouldIndex) {
    return {
      index: false,
      follow: false,
      googleBot: { index: false, follow: false },
    };
  }

  return {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  };
}

export function slugToLocation(slug: string): string {
  const raw = slug.replace(LOCATION_SLUG_PREFIX, "").replace(/-/g, " ");
  return raw.replace(/\b\w/g, (char) => char.toUpperCase());
}

export function locationToSlug(location: string): string {
  return LOCATION_SLUG_PREFIX + location.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
}

export function categoryToSlug(category: string) {
  return category.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
}

export function categoryFromSlug(slug: string, categories: string[]) {
  if (slug === ALL_CATEGORY_SLUG) return "";

  return categories.find((category) => categoryToSlug(category) === slug);
}

export function formatLocationList(locations: string[]) {
  if (locations.length <= 2) return locations.join(" dan ");

  return `${locations.slice(0, -1).join(", ")}, dan ${locations[locations.length - 1]}`;
}

export function formatKeywordList(keywords: string[]) {
  const quotedKeywords = keywords.map((keyword) => `"${keyword}"`);

  return formatLocationList(quotedKeywords);
}

function getCategoryLabel(category?: string) {
  return category || "Properti";
}

export function getSearchResultsTitle({
  q,
  locations,
  category,
}: Pick<ProductFilters, "q" | "locations" | "category">) {
  const keywords = q.map((keyword) => keyword.trim()).filter(Boolean);
  const locationText = formatLocationList(locations);
  const keywordText = formatKeywordList(keywords);
  const titleSubject = `${getCategoryLabel(category)} Seken`;

  if (locationText && keywordText) {
    return `${titleSubject} di ${locationText} dengan kata kunci ${keywordText}`;
  }

  if (locationText) return `${titleSubject} di ${locationText}`;
  if (keywordText) return `${titleSubject} dengan kata kunci ${keywordText}`;
  if (category) return titleSubject;

  return "Semua produk";
}

export function getSearchMetadataDescription(location?: string, category?: string) {
  if (location) {
    const productText = category ? `${category.toLowerCase()} bekas` : "barang bekas";

    return `Cari ${productText} berkualitas di ${location}. Temukan properti, elektronik, furnitur, dan produk seken terpercaya di Pojok Seken.`;
  }

  return "Temukan barang bekas berkualitas dengan harga terbaik di Pojok Seken. Cari properti, elektronik, furnitur, dan produk seken terpercaya.";
}

export function getSearchMetadataTitle(location?: string, category?: string) {
  if (location) {
    const productText = category ? `${category} Bekas` : "Barang Bekas";

    return `${productText} di ${location} harga ${SEARCH_SEO_YEAR} | Pojok Seken`;
  }

  return `Pencarian Barang Bekas Harga ${SEARCH_SEO_YEAR} | Pojok Seken`;
}

export function getSearchMetadataKeywords(location?: string, category?: string) {
  if (!location) return SEARCH_KEYWORDS;

  const categoryKeywords = category
    ? [
        `${category.toLowerCase()} bekas ${location}`,
        `${category.toLowerCase()} seken ${location}`,
      ]
    : [];

  return [
    ...categoryKeywords,
    `barang bekas ${location}`,
    `barang seken ${location}`,
    `jual beli barang bekas ${location}`,
    `marketplace barang seken ${location}`,
    ...SEARCH_KEYWORDS,
  ];
}

export function getCleanSearchHref(formData: FormData) {
  const submittedLocations = formData
    .getAll("location")
    .map((location) => String(location))
    .filter(Boolean);
  const category = String(formData.get("category") || "");
  const query = new URLSearchParams();

  formData.forEach((value, key) => {
    const stringValue = String(value);
    if (!stringValue) return;
    if (key === "sort" && stringValue === "default") return;
    if (key === "location" && submittedLocations.length === 1) return;
    if (key === "category" && category) return;
    query.append(key, stringValue);
  });

  const categoryPath = category ? `/search/${categoryToSlug(category)}` : "/search";
  const path =
    submittedLocations.length === 1
      ? `${categoryPath === "/search" ? `/search/${ALL_CATEGORY_SLUG}` : categoryPath}/${locationToSlug(submittedLocations[0])}`
      : categoryPath;
  const queryString = query.toString();

  return `${path}${queryString ? `?${queryString}` : ""}`;
}

export function getProductFacets(productList: Product[]) {
  return {
    conditions: [...new Set(productList.map((product) => product.condition))],
    locations: [...new Set(productList.map((product) => product.location))]
      .filter((location) => !!location)
      .sort(),
    years: [...new Set(productList.map((product) => product.year))]
      .filter((year) => year && !isNaN(Number(year)))
      .sort((firstYear, secondYear) => Number(secondYear) - Number(firstYear)),
    minimumProductPrice: productList.length
      ? Math.min(...productList.map((product) => product.price))
      : 0,
  };
}

export function getActiveFilterCount({
  q,
  category,
  condition,
  locations,
  minPrice,
  maxPrice,
  minYear,
  verified,
}: ProductFilters) {
  return [
    ...q,
    category,
    condition,
    ...locations,
    minPrice,
    maxPrice,
    minYear,
    verified ? "verified" : "",
  ].filter(Boolean).length;
}

export function filterProducts({
  q,
  category,
  condition,
  locations,
  minPrice,
  maxPrice,
  minYear,
  verified,
  productList,
}: ProductFilters & { productList: Product[] }) {
  const normalizedKeywords = q.map((keyword) => keyword.toLowerCase().trim()).filter(Boolean);
  const normalizedLocations = locations.map((location) => location.toLowerCase().trim());
  const minimumYear = Number(minYear);

  return productList.filter((product) => {
    const searchableText = [product.name, product.category, product.location, product.description]
      .join(" ")
      .toLowerCase();
    const matchesQuery =
      normalizedKeywords.length === 0 ||
      normalizedKeywords.every((keyword) => searchableText.includes(keyword));
    const matchesCategory = !category || product.category === category;
    const matchesCondition = !condition || product.condition === condition;
    const matchesLocation =
      normalizedLocations.length === 0 ||
      normalizedLocations.includes(product.location.toLowerCase());
    const matchesMinPrice = !minPrice || product.price >= minPrice;
    const matchesMaxPrice = !maxPrice || product.price <= maxPrice;
    const matchesYear = !minimumYear || Number(product.year) >= minimumYear;
    const matchesVerified = !verified || product.is_verified === true;

    return (
      matchesQuery &&
      matchesCategory &&
      matchesCondition &&
      matchesLocation &&
      matchesMinPrice &&
      matchesMaxPrice &&
      matchesYear &&
      matchesVerified
    );
  });
}

export function sortProducts(productsToSort: Product[], sort: string) {
  return [...productsToSort].sort((firstProduct, secondProduct) => {
    if (sort === "price-asc") return firstProduct.price - secondProduct.price;
    if (sort === "price-desc") return secondProduct.price - firstProduct.price;
    if (sort === "year-desc") return Number(secondProduct.year) - Number(firstProduct.year);

    return firstProduct.id - secondProduct.id;
  });
}
