import type { Metadata } from "next";
import Link from "next/link";
import ProductCard from "@/components/ProductCard";
import SchemaScript from "@/components/SchemaScript";
import { SearchIcon, ShieldIcon } from "@/components/Icons";
import { formatPrice, getCategories, getProducts, siteConfig, type Product } from "@/data/products";
import PriceRangeInputs from "@/app/search/PriceRangeInputs";
import SearchKeywordInput from "@/app/search/SearchKeywordInput";

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

function getNumberParam(value: string | string[] | undefined) {
  const number = Number(getSingleParam(value));
  return Number.isFinite(number) && number > 0 ? number : undefined;
}

function filterProducts({
  q,
  category,
  condition,
  location,
  minPrice,
  maxPrice,
  minYear,
  verified,
  productList
}: {
  q: string;
  category: string;
  condition: string;
  location: string;
  minPrice?: number;
  maxPrice?: number;
  minYear: string;
  verified: boolean;
  productList: Product[];
}) {
  const normalizedQuery = q.toLowerCase().trim();
  const normalizedLocation = location.toLowerCase().trim();
  const minimumYear = Number(minYear);

  return productList.filter((product) => {
    const matchesQuery =
      !normalizedQuery ||
      [product.name, product.category, product.location, product.description]
        .join(" ")
        .toLowerCase()
        .includes(normalizedQuery);
    const matchesCategory = !category || product.category === category;
    const matchesCondition = !condition || product.condition === condition;
    const matchesLocation =
      !normalizedLocation || product.location.toLowerCase() === normalizedLocation;
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

function sortProducts(productsToSort: Product[], sort: string) {
  return [...productsToSort].sort((firstProduct, secondProduct) => {
    if (sort === "price-asc") {
      return firstProduct.price - secondProduct.price;
    }

    if (sort === "price-desc") {
      return secondProduct.price - firstProduct.price;
    }

    if (sort === "year-desc") {
      return Number(secondProduct.year) - Number(firstProduct.year);
    }

    return firstProduct.id - secondProduct.id;
  });
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const params = await searchParams;
  const categories = await getCategories();
  const productList = await getProducts();
  const q = getSingleParam(params?.q);
  const category = getSingleParam(params?.category);
  const condition = getSingleParam(params?.condition);
  const location = getSingleParam(params?.location);
  const minPrice = getNumberParam(params?.minPrice);
  const maxPrice = getNumberParam(params?.maxPrice);
  const minYear = getSingleParam(params?.minYear);
  const sort = getSingleParam(params?.sort) || "default";
  const verified = getSingleParam(params?.verified) === "true";
  const filteredProducts = filterProducts({
    q,
    category,
    condition,
    location,
    minPrice,
    maxPrice,
    minYear,
    verified,
    productList
  });
  const results = sortProducts(filteredProducts, sort);
  const conditions = [...new Set(productList.map((product) => product.condition))];
  const locations = [...new Set(productList.map((product) => product.location))]
    .filter((loc) => loc && loc.toLowerCase() !== "indonesia")
    .sort();
  const years = [...new Set(productList.map((product) => product.year))]
    .filter((y) => y && !isNaN(Number(y)))
    .sort((a, b) => Number(b) - Number(a));
  const minimumProductPrice = productList.length
    ? Math.min(...productList.map((product) => product.price))
    : 0;
  const activeFilterCount = [
    q,
    category,
    condition,
    location,
    minPrice,
    maxPrice,
    minYear,
    verified ? "verified" : ""
  ].filter(Boolean).length;
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
      <section className="search-topbar" data-test-id="search-breadcrumbs">
        <div className="container search-topbar-inner">
          <div className="breadcrumb">
            <Link href="/" data-test-id="search-breadcrumb-home">
              Beranda
            </Link>
            <span>/</span>
            <span>Semua Produk</span>
          </div>
          <div className="active-count" data-test-id="search-active-count">
            <span />
            <strong>{productList.length}</strong> iklan aktif hari ini
          </div>
        </div>
      </section>

      <section className="search-hero" data-test-id="search-hero">
        <div className="container search-hero-inner">
          <div>
            <p className="eyebrow">Cari barang bekas</p>
            <h1>Temukan barang yang pas tanpa muter-muter.</h1>
            <p>
              Saring berdasarkan kata kunci, kategori, lokasi, kondisi, harga, dan tahun
              supaya pilihan yang muncul lebih relevan.
            </p>
          </div>
          <div className="search-hero-card" data-test-id="search-hero-card">
            <ShieldIcon />
            <strong>COD dulu, cek barang langsung</strong>
            <p>Prioritaskan penjual lokal dan detail kondisi yang transparan.</p>
          </div>
        </div>
      </section>

      <main className="search-page section" data-test-id="search-page">
        <div className="container">
          <div className="search-shell" data-test-id="search-shell">
            {/* Search + filters top bar */}
            <form className="search-primary" action="/search" data-test-id="search-filter-form">
              <label className="sr-only" htmlFor="search-keyword">
                Cari nama atau lokasi
              </label>
              <SearchKeywordInput defaultValue={q} locations={locations} />
              <select
                name="category"
                defaultValue={category}
                aria-label="Pilih kategori"
                data-test-id="search-category-select"
              >
                <option value="">Semua kategori</option>
                {categories.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
              <select
                name="condition"
                defaultValue={condition}
                aria-label="Pilih kondisi"
                data-test-id="search-condition-select"
              >
                <option value="">Semua kondisi</option>
                {conditions.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
              <button className="button" type="submit" data-test-id="search-submit">
                <SearchIcon />
                Cari
              </button>
            </form>

            {/* Secondary filter bar */}
            <form className="search-filters-bar" action="/search" data-test-id="search-sidebar">
              <input type="hidden" name="q" defaultValue={q} />
              <input type="hidden" name="category" defaultValue={category} />
              <input type="hidden" name="condition" defaultValue={condition} />
              <input type="hidden" name="location" defaultValue={location} />
              <input type="hidden" name="sort" defaultValue={sort} />

              <PriceRangeInputs
                key={`${minPrice ?? ""}-${maxPrice ?? ""}`}
                defaultMinPrice={minPrice}
                defaultMaxPrice={maxPrice}
              />

              <div className="filter-group">
                <label htmlFor="search-min-year">Tahun rilis</label>
                <select
                  key={minYear}
                  id="search-min-year"
                  name="minYear"
                  defaultValue={minYear}
                  data-test-id="search-min-year-select"
                >
                  <option value="">Semua tahun</option>
                  {years.map((y) => (
                    <option key={y} value={y}>{y} ke atas</option>
                  ))}
                </select>
              </div>

              <label className="check-filter" data-test-id="search-verified-filter">
                <input
                  key={String(verified)}
                  type="checkbox"
                  name="verified"
                  value="true"
                  defaultChecked={verified}
                />
                Iklan terverifikasi saja
              </label>

              <div className="filter-bar-actions">
                {activeFilterCount > 0 ? (
                  <Link href="/search" data-test-id="search-reset-filters">
                    Reset
                  </Link>
                ) : null}
                <button className="button" type="submit" data-test-id="search-sidebar-submit">
                  Terapkan filter
                </button>
              </div>
            </form>

            {/* Results + ads sidebar */}
            <div className="search-layout">
              {/* Ads slot */}
              <aside className="search-ads-slot" aria-label="Iklan" data-test-id="search-ads-slot">
                <div className="ads-placeholder p-2 text-center">
                  <span>Search Sidebar Ads Slot Available</span>
                </div>
              </aside>

              <section className="search-results" data-test-id="search-results">
                <form className="result-toolbar" action="/search" data-test-id="search-result-toolbar">
                  <input type="hidden" name="q" defaultValue={q} />
                  <input type="hidden" name="category" defaultValue={category} />
                  <input type="hidden" name="condition" defaultValue={condition} />
                  <input type="hidden" name="location" defaultValue={location} />
                  <input type="hidden" name="minPrice" defaultValue={minPrice || ""} />
                  <input type="hidden" name="maxPrice" defaultValue={maxPrice || ""} />                  <input type="hidden" name="minYear" defaultValue={minYear} />
                  {verified ? <input type="hidden" name="verified" defaultValue="true" /> : null}
                  <div>
                    <p className="eyebrow">{results.length} produk ditemukan</p>
                    <h2>{q ? `Hasil untuk "${q}"` : "Semua produk"}</h2>
                  </div>
                  <div className="sort-control">
                    <label htmlFor="search-sort">Urutkan</label>
                    <select
                      id="search-sort"
                      name="sort"
                      defaultValue={sort}
                      data-test-id="search-sort-select"
                    >
                      <option value="default">Paling sesuai</option>
                      <option value="price-asc">Harga terendah</option>
                      <option value="price-desc">Harga tertinggi</option>
                      <option value="year-desc">Tahun terbaru</option>
                    </select>
                  </div>
                  <button className="button secondary" type="submit" data-test-id="search-sort-submit">
                    Terapkan
                  </button>
                </form>

                {results.length > 0 ? (
                  <div className="grid search-grid" data-test-id="search-product-grid">
                    {results.map((product) => (
                      <ProductCard key={product.id} product={product} />
                    ))}
                  </div>
                ) : (
                  <div className="empty-state" data-test-id="search-empty-state">
                    <SearchIcon />
                    <h3>Tidak ada produk cocok</h3>
                    <p>Ubah kriteria pencarian atau bersihkan filter untuk melihat koleksi.</p>
                    <Link className="button" href="/search" data-test-id="search-empty-reset">
                      Bersihkan filter
                    </Link>
                  </div>
                )}
              </section>
            </div>
          </div>

          <div className="search-info" data-test-id="search-info-block">
            <div>
              <p className="eyebrow">Belanja lebih cerdas</p>
              <h2>Pojok Seken membantu kamu membandingkan barang bekas dengan cepat.</h2>
            </div>
            <p>
              Gunakan filter lokasi seperti Jakarta Selatan, Bandung, Tangerang, Bekasi,
              Depok, dan Jakarta Barat agar proses cek fisik lebih praktis. Cek kondisi,
              tahun, harga, serta detail penjual sebelum melanjutkan transaksi.
            </p>
            <div className="info-stats">
              <span>harga mulai {formatPrice(minimumProductPrice)}</span>
              <span>{categories.length} kategori</span>
              <span>{locations.length} lokasi</span>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
