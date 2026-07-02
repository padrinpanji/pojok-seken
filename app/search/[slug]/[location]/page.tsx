import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getCategories, getProducts } from "@/data/products";
import SearchLocationPage from "@/app/search/[slug]/SearchLocationPage";
import {
  ALL_CATEGORY_SLUG,
  LOCATION_SLUG_PREFIX,
  categoryFromSlug,
  categoryToSlug,
  getSearchMetadataDescription,
  getSearchMetadataKeywords,
  getSearchMetadataTitle,
  getSearchRobots,
  hasSearchFilters,
  locationToSlug,
  slugToLocation,
} from "@/app/search/search-utils";

type Props = {
  params: Promise<{ slug: string; location: string }>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
  const { slug, location: locationSlug } = await params;
  const resolvedSearchParams = await searchParams;
  if (!locationSlug.startsWith(LOCATION_SLUG_PREFIX)) return {};

  const [categories, products] = await Promise.all([getCategories(), getProducts()]);
  const availableCategories = categories.length
    ? categories
    : [...new Set(products.map((product) => product.category).filter(Boolean))];
  const matchedCategory = categoryFromSlug(slug, categories);
  const fallbackCategory = categoryFromSlug(slug, availableCategories);
  if (slug !== ALL_CATEGORY_SLUG && fallbackCategory === undefined) return {};

  const location = slugToLocation(locationSlug);
  const title = getSearchMetadataTitle(location, fallbackCategory || matchedCategory || undefined);
  const description = getSearchMetadataDescription(location, fallbackCategory || matchedCategory || undefined);
  const canonical = `/search/${slug}/${locationSlug}`;

  return {
    title: { absolute: title },
    description,
    keywords: getSearchMetadataKeywords(location, fallbackCategory || matchedCategory || undefined),
    alternates: { canonical },
    robots: getSearchRobots(!hasSearchFilters(resolvedSearchParams)),
    openGraph: {
      title,
      description,
      url: canonical,
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

export async function generateStaticParams() {
  const [products, categories] = await Promise.all([getProducts(), getCategories()]);
  const locations = [...new Set(products.map((product) => product.location).filter(Boolean))];
  const availableCategories = categories.length
    ? categories
    : [...new Set(products.map((product) => product.category).filter(Boolean))];
  const categorySlugs = [
    ALL_CATEGORY_SLUG,
    ...availableCategories.map((category) => categoryToSlug(category)),
  ];

  return categorySlugs.flatMap((category) =>
    locations.map((location) => ({ slug: category, location: locationToSlug(location) }))
  );
}

export default async function SearchByCategoryLocationRoute({ params, searchParams }: Props) {
  const { slug, location } = await params;
  const resolvedSearchParams = await searchParams;

  if (!location.startsWith(LOCATION_SLUG_PREFIX)) notFound();

  return <SearchLocationPage slug={location} categorySlug={slug} searchParams={resolvedSearchParams} />;
}
