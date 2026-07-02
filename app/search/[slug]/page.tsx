import type { Metadata } from "next";
import { notFound } from "next/navigation";
import SearchPageContent from "@/app/search/SearchPageContent";
import { getCategories, getProducts } from "@/data/products";
import SearchLocationPage from "@/app/search/[slug]/SearchLocationPage";
import {
  ALL_CATEGORY_SLUG,
  LOCATION_SLUG_PREFIX,
  SEARCH_SEO_YEAR,
  categoryFromSlug,
  categoryToSlug,
  getArrayParam,
  getNumberParam,
  getSearchMetadataDescription,
  getSearchMetadataKeywords,
  getSearchMetadataTitle,
  getSearchRobots,
  getSearchResultsTitle,
  getSingleParam,
  hasSearchFilters,
  locationToSlug,
  slugToLocation,
} from "@/app/search/search-utils";

type Props = {
  params: Promise<{ slug: string }>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
  const { slug } = await params;
  const resolvedSearchParams = await searchParams;
  const shouldIndex = !hasSearchFilters(resolvedSearchParams);

  if (!slug.startsWith(LOCATION_SLUG_PREFIX)) {
    const categories = await getCategories();
    const category = categoryFromSlug(slug, categories);
    if (category === undefined || category === "") return {};

    const title = `${category} Bekas Harga ${SEARCH_SEO_YEAR} | Pojok Seken`;
    const description = `Cari ${category.toLowerCase()} bekas berkualitas dengan harga terbaik di Pojok Seken. Bandingkan produk seken terpercaya dari berbagai penjual.`;

    return {
      title: { absolute: title },
      description,
      keywords: [
        `${category.toLowerCase()} bekas`,
        `${category.toLowerCase()} seken`,
        `jual beli ${category.toLowerCase()} bekas`,
        ...getSearchMetadataKeywords(),
      ],
      alternates: { canonical: `/search/${slug}` },
      robots: getSearchRobots(shouldIndex),
    };
  }

  const location = slugToLocation(slug);
  const title = getSearchMetadataTitle(location);
  const description = getSearchMetadataDescription(location);

  return {
    title: { absolute: title },
    description,
    keywords: getSearchMetadataKeywords(location),
    alternates: { canonical: `/search/${ALL_CATEGORY_SLUG}/${slug}` },
    robots: getSearchRobots(shouldIndex),
    openGraph: {
      title,
      description,
      url: `/search/${ALL_CATEGORY_SLUG}/${slug}`,
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

  return [
    ...locations.map((location) => ({ slug: locationToSlug(location) })),
    ...categories.map((category) => ({ slug: categoryToSlug(category) })),
  ];
}

export default async function SearchByLocationRoute({ params, searchParams }: Props) {
  const { slug } = await params;
  const resolvedSearchParams = await searchParams;

  if (!slug.startsWith(LOCATION_SLUG_PREFIX)) {
    const [categories, productList] = await Promise.all([getCategories(), getProducts()]);
    const category = categoryFromSlug(slug, categories);

    if (category === undefined || category === "") notFound();

    const filters = {
      q: getArrayParam(resolvedSearchParams?.q),
      category,
      condition: getSingleParam(resolvedSearchParams?.condition),
      locations: getArrayParam(resolvedSearchParams?.location),
      sort: getSingleParam(resolvedSearchParams?.sort) || "default",
      minPrice: getNumberParam(resolvedSearchParams?.minPrice),
      maxPrice: getNumberParam(resolvedSearchParams?.maxPrice),
      minYear: getSingleParam(resolvedSearchParams?.minYear),
      verified: getSingleParam(resolvedSearchParams?.verified) === "true",
    };

    return (
      <SearchPageContent
        categories={categories}
        productList={productList}
        filters={filters}
        schema={{
          name: `${category} bekas Pojok Seken`,
          url: `/search/${slug}`,
          about: `Jual beli ${category.toLowerCase()} bekas berkualitas`,
        }}
        breadcrumbs={[
          { label: "Beranda", href: "/", testId: "search-breadcrumb-home" },
          { label: "Semua Produk", href: "/search" },
          { label: category },
        ]}
        hero={{
          eyebrow: `${category} bekas`,
          title: `Temukan ${category.toLowerCase()} bekas yang pas.`,
          description:
            "Saring berdasarkan kata kunci, lokasi, kondisi, harga, dan tahun supaya pilihan yang muncul lebih relevan.",
          showTrustCard: true,
        }}
        resultsTitle={getSearchResultsTitle(filters)}
        emptyState={{
          title: `Tidak ada ${category.toLowerCase()} cocok`,
          description: "Ubah kriteria pencarian atau bersihkan filter untuk melihat koleksi.",
          actionLabel: "Bersihkan filter",
        }}
        infoDescription="Gunakan filter lokasi agar proses cek fisik lebih praktis. Cek kondisi, tahun, harga, serta detail penjual sebelum melanjutkan transaksi."
        showSort
      />
    );
  }

  return <SearchLocationPage slug={slug} searchParams={resolvedSearchParams} />;
}
