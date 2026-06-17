import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import ProductCard from "@/components/ProductCard";
import SchemaScript from "@/components/SchemaScript";
import { SearchIcon } from "@/components/Icons";
import { getSellerBySlug, getSellerProfiles, siteConfig } from "@/data/products";

type UserProfilePageProps = {
  params: Promise<{
    slug: string;
  }>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export function generateStaticParams() {
  return getSellerProfiles().map((seller) => ({
    slug: seller.slug
  }));
}

export async function generateMetadata({ params }: UserProfilePageProps): Promise<Metadata> {
  const { slug } = await params;
  const seller = getSellerBySlug(slug);

  if (!seller) {
    return {
      title: "Profil Penjual Tidak Ditemukan"
    };
  }

  const description = `${seller.name} adalah penjual terverifikasi di Pojok Seken dari ${seller.location} dengan ${seller.products.length} listing aktif.`;

  return {
    title: `${seller.name} - Profil Penjual Terverifikasi`,
    description,
    alternates: {
      canonical: `/users/${seller.slug}`
    },
    openGraph: {
      type: "profile",
      title: `${seller.name} di Pojok Seken`,
      description,
      url: `${siteConfig.url}/users/${seller.slug}`,
      images: [
        {
          url: seller.products[0]?.image || "/images/hero-market.svg",
          width: 1200,
          height: 630,
          alt: `Profil ${seller.name}`
        }
      ]
    }
  };
}

function getSingleParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] || "" : value || "";
}

export default async function UserProfilePage({ params, searchParams }: UserProfilePageProps) {
  const { slug } = await params;
  const queryParams = await searchParams;
  const seller = getSellerBySlug(slug);

  if (!seller) {
    notFound();
  }

  const sellerCategories = [...new Set(seller.products.map((product) => product.category))];
  const activeCategory = getSingleParam(queryParams?.category);
  const q = getSingleParam(queryParams?.q);
  const normalizedQuery = q.toLowerCase().trim();
  const filteredProducts = seller.products.filter((product) => {
    const matchesCategory = !activeCategory || product.category === activeCategory;
    const matchesQuery =
      !normalizedQuery ||
      [product.name, product.category, product.condition, product.description]
        .join(" ")
        .toLowerCase()
        .includes(normalizedQuery);

    return matchesCategory && matchesQuery;
  });

  const sellerSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: seller.name,
    url: `${siteConfig.url}/users/${seller.slug}`,
    areaServed: seller.location,
    brand: {
      "@type": "Brand",
      name: siteConfig.name
    },
    makesOffer: seller.products.map((product) => ({
      "@type": "Offer",
      itemOffered: {
        "@type": "Product",
        name: product.name,
        url: `${siteConfig.url}/products/${product.slug}`,
        image: product.image
      },
      price: product.price,
      priceCurrency: "IDR"
    }))
  };

  return (
    <>
      <SchemaScript data={sellerSchema} />
      <section className="profile-topbar" data-test-id="seller-profile-breadcrumbs">
        <div className="container breadcrumb">
          <Link href="/">Beranda</Link>
          <span>/</span>
          <Link href="/users">Penjual</Link>
          <span>/</span>
          <span>{seller.name}</span>
        </div>
      </section>

      <main className="seller-profile-page section" data-test-id="seller-profile-page">
        <div className="container seller-profile-hero">
          <div className="seller-avatar large" aria-hidden="true">
            {seller.initials}
            <span />
          </div>
          <div className="seller-profile-copy">
            <p className="eyebrow">Profil penjual terverifikasi</p>
            <h1>{seller.name}</h1>
            <div className="profile-rating" aria-label="Rating penjual 5 dari 5">
              <span aria-hidden="true">★★★★★</span>
              <strong>5.0 dari 5</strong>
            </div>
            <p>
              Penjual aktif di Pojok Seken dari {seller.location}. Lihat listing yang tersedia,
              cek detail barang, dan utamakan COD sebelum transaksi.
            </p>
          </div>
          <div className="seller-profile-badge">Toko terverifikasi</div>
        </div>

        <section className="container seller-listing-filters" aria-label="Filter listing penjual">
          <div>
            <p className="eyebrow">Kategori dijual</p>
          </div>
          <div className="seller-category-list">
            <Link
              className={!activeCategory ? "active" : undefined}
              href={q ? `/users/${seller.slug}?q=${encodeURIComponent(q)}` : `/users/${seller.slug}`}
              scroll={false}
            >
              Semua
            </Link>
            {sellerCategories.map((category) => (
              <Link
                key={category}
                className={activeCategory === category ? "active" : undefined}
                href={`/users/${seller.slug}?category=${encodeURIComponent(category)}${q ? `&q=${encodeURIComponent(q)}` : ""}`}
                scroll={false}
              >
                {category}
              </Link>
            ))}
          </div>
          <form className="seller-product-search" action={`/users/${seller.slug}`} data-test-id="seller-product-search-form">
            {activeCategory ? <input type="hidden" name="category" defaultValue={activeCategory} /> : null}
            <div className="search-input-wrap">
              <SearchIcon />
              <input
                type="search"
                name="q"
                defaultValue={q}
                placeholder={`Cari produk dari ${seller.name}`}
                aria-label={`Cari produk dari ${seller.name}`}
                data-test-id="seller-product-search-input"
              />
            </div>
            <button className="button" type="submit">
              Cari
            </button>
            {q || activeCategory ? (
              <Link className="button secondary" href={`/users/${seller.slug}`} scroll={false}>
                Reset
              </Link>
            ) : null}
          </form>
        </section>

        <section className="container seller-profile-listings">
          <div className="section-head">
            <div>
              <p className="eyebrow">{filteredProducts.length} listing ditemukan</p>
              <h2>
                {q
                  ? `Hasil "${q}" dari ${seller.name}`
                  : activeCategory
                  ? `${filteredProducts.length} ${activeCategory} dari ${seller.name}`
                  : `Barang dari ${seller.name}`}
              </h2>
            </div>
          </div>
          {filteredProducts.length > 0 ? (
            <div className="grid seller-products-grid" data-test-id="seller-products-grid">
              {filteredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="empty-state" data-test-id="seller-products-empty-state">
              <SearchIcon />
              <h2>Produk tidak ditemukan</h2>
              <p>Coba kata kunci lain atau pilih kategori berbeda dari toko ini.</p>
              <Link className="button" href={`/users/${seller.slug}`}>
                Lihat semua listing
              </Link>
            </div>
          )}
        </section>
      </main>
    </>
  );
}
