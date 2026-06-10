import type { Metadata } from "next";
import ProductCard from "@/components/ProductCard";
import SchemaScript from "@/components/SchemaScript";
import { SearchIcon } from "@/components/Icons";
import { categories, products, searchProducts, siteConfig } from "@/data/products";

export const metadata: Metadata = {
  title: "Search Barang Bekas",
  description:
    "Cari barang bekas berkualitas di Pojok Seken berdasarkan kategori, kondisi, lokasi, dan kebutuhan harian.",
  alternates: {
    canonical: "/search"
  }
};

type SearchPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

function getSingleParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] || "" : value || "";
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const params = await searchParams;
  const q = getSingleParam(params?.q);
  const category = getSingleParam(params?.category);
  const condition = getSingleParam(params?.condition);
  const results = searchProducts({ q, category, condition });
  const conditions = [...new Set(products.map((product) => product.condition))];
  const collectionSchema = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Search barang bekas Pojok Seken",
    url: `${siteConfig.url}/search`,
    about: "Jual beli barang bekas berkualitas"
  };

  return (
    <>
      <SchemaScript data={collectionSchema} />
      <section className="page-hero">
        <div className="container">
          <p className="eyebrow">Search produk bekas</p>
          <h1>Cari barang bekas berkualitas</h1>
          <p>Gunakan kata kunci dan filter untuk menemukan produk seken yang paling cocok.</p>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <form className="filters" action="/search">
            <input
              type="search"
              name="q"
              placeholder="Cari nama, kategori, lokasi..."
              defaultValue={q}
              aria-label="Kata kunci pencarian"
            />
            <select name="category" defaultValue={category} aria-label="Pilih kategori">
              <option value="">Semua kategori</option>
              {categories.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
            <select name="condition" defaultValue={condition} aria-label="Pilih kondisi">
              <option value="">Semua kondisi</option>
              {conditions.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
            <button className="button" type="submit">
              <SearchIcon />
              Cari
            </button>
          </form>

          <div className="section-head">
            <div>
              <p className="eyebrow">{results.length} produk ditemukan</p>
              <h2>{q ? `Hasil untuk "${q}"` : "Semua produk"}</h2>
            </div>
          </div>

          <div className="grid">
            {results.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
