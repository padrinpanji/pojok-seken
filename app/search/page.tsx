import type { Metadata } from "next";
import SearchPageContent from "@/app/search/SearchPageContent";
import { getCategories, getProducts } from "@/data/products";
import {
  getArrayParam,
  getNumberParam,
  getSearchMetadataDescription,
  getSearchMetadataKeywords,
  getSearchMetadataTitle,
  getSearchRobots,
  getSearchResultsTitle,
  getSingleParam,
} from "@/app/search/search-utils";

export const metadata: Metadata = {
  title: { absolute: getSearchMetadataTitle() },
  description: getSearchMetadataDescription(),
  keywords: getSearchMetadataKeywords(),
  alternates: {
    canonical: "/search",
  },
  robots: getSearchRobots(false),
  openGraph: {
    title: getSearchMetadataTitle(),
    description: getSearchMetadataDescription(),
    url: "/search",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: getSearchMetadataTitle(),
    description: getSearchMetadataDescription(),
  },
};

type SearchPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const params = await searchParams;
  const [categories, productList] = await Promise.all([getCategories(), getProducts()]);
  const filters = {
    q: getArrayParam(params?.q),
    category: getSingleParam(params?.category),
    condition: getSingleParam(params?.condition),
    locations: getArrayParam(params?.location),
    minPrice: getNumberParam(params?.minPrice),
    maxPrice: getNumberParam(params?.maxPrice),
    minYear: getSingleParam(params?.minYear),
    sort: getSingleParam(params?.sort) || "default",
    verified: getSingleParam(params?.verified) === "true",
  };

  return (
    <SearchPageContent
      categories={categories}
      productList={productList}
      filters={filters}
      schema={{
        name: "Search barang bekas Pojok Seken",
        url: "/search",
        about: "Jual beli barang bekas berkualitas",
      }}
      breadcrumbs={[
        { label: "Beranda", href: "/", testId: "search-breadcrumb-home" },
        { label: "Semua Produk" },
      ]}
      hero={{
        eyebrow: "Cari barang bekas",
        title: "Temukan barang yang pas tanpa muter-muter.",
        description:
          "Saring berdasarkan kata kunci, kategori, lokasi, kondisi, harga, dan tahun supaya pilihan yang muncul lebih relevan.",
        showTrustCard: true,
      }}
      resultsTitle={getSearchResultsTitle(filters)}
      emptyState={{
        title: "Tidak ada produk cocok",
        description: "Ubah kriteria pencarian atau bersihkan filter untuk melihat koleksi.",
        actionLabel: "Bersihkan filter",
      }}
      infoDescription="Gunakan filter lokasi seperti Jakarta Selatan, Bandung, Tangerang, Bekasi, Depok, dan Jakarta Barat agar proses cek fisik lebih praktis. Cek kondisi, tahun, harga, serta detail penjual sebelum melanjutkan transaksi."
      showSort
    />
  );
}
