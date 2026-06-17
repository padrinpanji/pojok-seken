import type { Metadata } from "next";
import Link from "next/link";
import SchemaScript from "@/components/SchemaScript";
import { SearchIcon } from "@/components/Icons";
import { getSellerProfiles, siteConfig } from "@/data/products";

export const metadata: Metadata = {
  title: "Cari Penjual Terverifikasi",
  description:
    "Temukan profil penjual terverifikasi di Pojok Seken berdasarkan nama toko, lokasi, dan listing aktif.",
  alternates: {
    canonical: "/users"
  }
};

type UsersPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

function getSingleParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] || "" : value || "";
}

export default async function UsersPage({ searchParams }: UsersPageProps) {
  const params = await searchParams;
  const q = getSingleParam(params?.q);
  const normalizedQuery = q.toLowerCase().trim();
  const sellers = getSellerProfiles();
  const results = sellers.filter((seller) => {
    if (!normalizedQuery) {
      return true;
    }

    return seller.name.toLowerCase().includes(normalizedQuery);
  });

  const usersSchema = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Cari Penjual Terverifikasi Pojok Seken",
    description: metadata.description,
    url: `${siteConfig.url}/users`,
    mainEntity: results.map((seller) => ({
      "@type": "Organization",
      name: seller.name,
      url: `${siteConfig.url}/users/${seller.slug}`,
      areaServed: seller.location
    }))
  };

  return (
    <>
      <SchemaScript data={usersSchema} />
      <section className="profile-topbar" data-test-id="users-breadcrumbs">
        <div className="container breadcrumb">
          <Link href="/">Beranda</Link>
          <span>/</span>
          <span>Penjual</span>
        </div>
      </section>

      <main className="users-page section" data-test-id="users-page">
        <section className="container users-hero">
          <div>
            <p className="eyebrow">Penjual terverifikasi</p>
            <h1>Cari profil penjual Pojok Seken</h1>
            <p>
              Temukan toko terpercaya, lihat listing aktif, dan cek lokasi penjual sebelum
              bertransaksi.
            </p>
          </div>
          <form className="users-search" action="/users" data-test-id="users-search-form">
            <div className="search-input-wrap">
              <SearchIcon />
              <input
                type="search"
                name="q"
                defaultValue={q}
                placeholder="Cari nama penjual"
                aria-label="Cari penjual"
                data-test-id="users-search-input"
              />
            </div>
            <button className="button" type="submit">
              Cari
            </button>
          </form>
        </section>

        <section className="container users-results">
          <div className="section-head">
            <div>
              <p className="eyebrow">{results.length} profil ditemukan</p>
              <h2>{q ? `Hasil untuk "${q}"` : "Semua penjual terverifikasi"}</h2>
            </div>
            {q ? (
              <Link className="button secondary" href="/users">
                Reset pencarian
              </Link>
            ) : null}
          </div>

          {results.length > 0 ? (
            <div className="users-grid" data-test-id="users-grid">
              {results.map((seller) => (
                <article className="user-card" key={seller.slug}>
                  <div className="seller-avatar" aria-hidden="true">
                    {seller.initials}
                    <span />
                  </div>
                  <div>
                    <p>Toko terverifikasi</p>
                    <h3>
                      <Link href={`/users/${seller.slug}`}>{seller.name}</Link>
                    </h3>
                    <span>{seller.location}</span>
                    <div className="user-rating" aria-label="Rating penjual 5 dari 5">
                      <span aria-hidden="true">★★★★★</span>
                      <strong>5.0</strong>
                    </div>
                  </div>
                  <div className="user-card-metrics">
                    <span>{seller.products.length} listing aktif</span>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="empty-state" data-test-id="users-empty-state">
              <SearchIcon />
              <h2>Penjual tidak ditemukan</h2>
              <p>Coba gunakan nama toko, kota, atau nama barang yang lebih umum.</p>
              <Link className="button" href="/users">
                Lihat semua penjual
              </Link>
            </div>
          )}
        </section>
      </main>
    </>
  );
}
