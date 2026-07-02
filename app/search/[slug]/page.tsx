import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getProducts } from "@/data/products";
import SearchLocationPage from "@/app/search/[slug]/SearchLocationPage";
import {
  LOCATION_SLUG_PREFIX,
  getSearchMetadataDescription,
  getSearchMetadataKeywords,
  getSearchMetadataTitle,
  locationToSlug,
  slugToLocation,
} from "@/app/search/search-utils";

type Props = {
  params: Promise<{ slug: string }>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  if (!slug.startsWith(LOCATION_SLUG_PREFIX)) return {};

  const location = slugToLocation(slug);
  const title = getSearchMetadataTitle(location);
  const description = getSearchMetadataDescription(location);

  return {
    title: { absolute: title },
    description,
    keywords: getSearchMetadataKeywords(location),
    alternates: { canonical: `/search/${slug}` },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
    openGraph: {
      title,
      description,
      url: `/search/${slug}`,
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
  const products = await getProducts();
  const locations = [...new Set(products.map((product) => product.location).filter(Boolean))];

  return locations.map((location) => ({ slug: locationToSlug(location) }));
}

export default async function SearchByLocationRoute({ params, searchParams }: Props) {
  const { slug } = await params;
  const resolvedSearchParams = await searchParams;

  if (!slug.startsWith(LOCATION_SLUG_PREFIX)) notFound();

  return <SearchLocationPage slug={slug} searchParams={resolvedSearchParams} />;
}
