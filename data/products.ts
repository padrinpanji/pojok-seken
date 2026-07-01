import { cache } from "react";
import { createSupabaseClient } from "@/lib/supabase";

export type Product = {
  id: number;
  slug: string;
  name: string;
  category: string;
  condition: string;
  price: number;
  location: string;
  image: string;
  gallery: string[];
  year: string;
  seller: string;
  description: string;
  highlights: string[];
  source_url?: string | null;
};

export type SellerProfile = {
  name: string;
  slug: string;
  location: string;
  initials: string;
  products: Product[];
};

type SearchProductsParams = {
  q?: string;
  category?: string;
  condition?: string;
};

type SupabaseCategoryRow = {
  name: string | null;
};

type SupabaseProductRow = {
  id: number | string | null;
  slug: string | null;
  name: string | null;
  category: string | null;
  condition: string | null;
  price: number | string | null;
  location: string | null;
  image: string | null;
  gallery: string[] | string | null;
  year: string | number | null;
  seller: string | null;
  description: string | null;
  highlights: string[] | string | null;
  source_url?: string | null;
};

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ||
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "https://pojok-seken.vercel.app");

export const siteConfig = {
  name: "Pojok Seken",
  url: siteUrl.replace(/\/$/, ""),
  description:
    "Pojok Seken adalah marketplace barang bekas berkualitas untuk laptop, kamera, furnitur, sepeda, dan kebutuhan rumah tangga pilihan.",
  city: "Jakarta",
  country: "ID",
  phone: "+62 812-3456-7890",
  email: "halo@pojokseken.id"
};

export function formatPrice(price: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0
  }).format(price);
}

export function slugifySeller(name: string) {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function getSellerInitials(name: string) {
  return name
    .split(" ")
    .map((word) => word[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function parseTextList(value: string[] | string | null, fallback: string[]) {
  if (Array.isArray(value)) {
    return value.filter(Boolean);
  }

  if (!value) {
    return fallback;
  }

  try {
    const parsedValue: unknown = JSON.parse(value);

    if (Array.isArray(parsedValue)) {
      return parsedValue.filter((item): item is string => typeof item === "string" && Boolean(item));
    }
  } catch {
    return value
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
  }

  return fallback;
}

function mapSupabaseProduct(row: SupabaseProductRow): Product | null {
  if (!row.slug || !row.name || !row.category || !row.condition || !row.location || !row.seller) {
    return null;
  }

  const price = Number(row.price);

  return {
    id: Number(row.id) || 0,
    slug: row.slug,
    name: row.name,
    category: row.category,
    condition: row.condition,
    price: Number.isFinite(price) ? price : 0,
    location: row.location,
    image: row.image || "/logo-pojok-seken.svg",
    gallery: parseTextList(row.gallery, row.image ? [row.image] : ["/logo-pojok-seken.svg"]),
    year: String(row.year || ""),
    seller: row.seller,
    description: row.description || "",
    highlights: parseTextList(row.highlights, []),
    source_url: row.source_url ?? null,
  };
}

export const getCategories = cache(async (): Promise<string[]> => {
  const supabase = createSupabaseClient();

  if (!supabase) {
    return [];
  }

  const { data, error } = await supabase.from("categories").select("name").order("id", { ascending: true });

  if (error || !data?.length) {
    return [];
  }

  return (data as SupabaseCategoryRow[])
    .map((category) => category.name)
    .filter((name): name is string => Boolean(name));
});

export const getConditions = cache(async (): Promise<string[]> => {
  const supabase = createSupabaseClient();

  if (!supabase) {
    return [];
  }

  const { data, error } = await supabase.from("listing_conditions").select("name").order("id", { ascending: true });

  if (error || !data?.length) {
    return [];
  }

  return (data as { name: string | null }[])
    .map((row) => row.name)
    .filter((name): name is string => Boolean(name));
});

export const getProducts = cache(async (): Promise<Product[]> => {
  const supabase = createSupabaseClient();

  if (!supabase) {
    return [];
  }

  const { data, error } = await supabase
    .from("products")
    .select("id, slug, name, category, condition, price, location, image, gallery, year, seller, description, highlights, source_url")
    .order("id", { ascending: true });

  if (error || !data?.length) {
    return [];
  }

  return (data as SupabaseProductRow[])
    .map(mapSupabaseProduct)
    .filter((product): product is Product => Boolean(product));
});

export async function getProductBySlug(slug: string) {
  const productList = await getProducts();

  return productList.find((product) => product.slug === slug);
}

export function getSellerProfilesFromProducts(productList: Product[]): SellerProfile[] {
  const sellerMap = new Map<string, Product[]>();

  productList.forEach((product) => {
    const sellerProducts = sellerMap.get(product.seller) || [];
    sellerProducts.push(product);
    sellerMap.set(product.seller, sellerProducts);
  });

  return Array.from(sellerMap.entries()).map(([name, sellerProducts]) => ({
    name,
    slug: slugifySeller(name),
    location: sellerProducts[0]?.location || siteConfig.city,
    initials: getSellerInitials(name),
    products: sellerProducts
  }));
}

export async function getSellerProfiles() {
  const productList = await getProducts();

  return getSellerProfilesFromProducts(productList);
}

export async function getSellerBySlug(slug: string) {
  const sellers = await getSellerProfiles();

  return sellers.find((seller) => seller.slug === slug);
}

export async function searchProducts({
  q = "",
  category = "",
  condition = ""
}: SearchProductsParams = {}) {
  const productList = await getProducts();
  const normalizedQuery = q.toLowerCase().trim();

  return productList.filter((product) => {
    const matchesQuery =
      !normalizedQuery ||
      [product.name, product.category, product.location, product.description]
        .join(" ")
        .toLowerCase()
        .includes(normalizedQuery);
    const matchesCategory = !category || product.category === category;
    const matchesCondition = !condition || product.condition === condition;

    return matchesQuery && matchesCategory && matchesCondition;
  });
}
