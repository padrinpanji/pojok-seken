import { notFound } from "next/navigation";
import SearchPageContent from "@/app/search/SearchPageContent";
import { getCategories, getProducts } from "@/data/products";
import {
  categoryFromSlug,
  getNumberParam,
  getSearchResultsTitle,
  getArrayParam,
  getSingleParam,
  slugToLocation,
} from "@/app/search/search-utils";

type Props = {
  slug: string;
  categorySlug?: string;
  searchParams?: Record<string, string | string[] | undefined>;
};

export default async function SearchLocationPage({ slug, categorySlug, searchParams }: Props) {
  const locationLabel = slugToLocation(slug);
  const [categories, productList] = await Promise.all([getCategories(), getProducts()]);
  const availableCategories = categories.length
    ? categories
    : [...new Set(productList.map((product) => product.category).filter(Boolean))];
  const locations = [
    ...new Set(productList.map((product) => product.location).filter(Boolean)),
  ].sort();
  const matchedLocation = locations.find(
    (location) => location.toLowerCase() === locationLabel.toLowerCase()
  );

  if (!matchedLocation) notFound();

  const matchedCategory = categorySlug
    ? categoryFromSlug(categorySlug, availableCategories)
    : getSingleParam(searchParams?.category);

  if (categorySlug && matchedCategory === undefined) notFound();

  const filters = {
    q: getArrayParam(searchParams?.q),
    category: matchedCategory || "",
    condition: getSingleParam(searchParams?.condition),
    locations: [matchedLocation],
    sort: getSingleParam(searchParams?.sort) || "default",
    minPrice: getNumberParam(searchParams?.minPrice),
    maxPrice: getNumberParam(searchParams?.maxPrice),
    minYear: getSingleParam(searchParams?.minYear),
    verified: getSingleParam(searchParams?.verified) === "true",
  };

  return (
      <SearchPageContent
      categories={availableCategories}
      productList={productList}
      filters={filters}
      schema={{
        name: `Barang Seken di ${matchedLocation}`,
        url: categorySlug ? `/search/${categorySlug}/${slug}` : `/search/${slug}`,
        about: `Jual beli barang bekas berkualitas di ${matchedLocation}`,
      }}
      breadcrumbs={[
        { label: "Beranda", href: "/" },
        { label: "Semua Produk", href: "/search" },
        { label: matchedLocation },
      ]}
      hero={{
        eyebrow: `Barang seken di ${matchedLocation}`,
        title: `Temukan barang bekas di ${matchedLocation}.`,
        description:
          "Saring berdasarkan kategori, kondisi, dan harga untuk hasil yang lebih relevan.",
      }}
      resultsTitle={getSearchResultsTitle(filters)}
      emptyState={{
        title: `Belum ada produk di ${matchedLocation}`,
        description: "Coba cari di lokasi lain atau lihat semua produk.",
        actionLabel: "Lihat semua produk",
      }}
    />
  );
}
