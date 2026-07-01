import Link from "next/link";
import ProductCard from "@/components/ProductCard";
import SchemaScript from "@/components/SchemaScript";
import { MapIcon, SearchIcon, ShieldIcon, SparkIcon } from "@/components/Icons";
import { formatPrice, getCategories, getProducts, siteConfig } from "@/data/products";

const categoryIconIds: Record<string, string> = {
  Elektronik: "category-electronics",
  Kamera: "category-camera",
  Furnitur: "category-furniture",
  Fashion: "category-fashion",
  Hobi: "category-hobby",
  Kendaraan: "category-vehicle"
};

export default async function HomePage() {
  const categories = await getCategories();
  const productList = await getProducts();
  const featuredProducts = productList.slice(0, 3);
  const heroProduct = productList.find((p) => p.is_featured) ?? null;
  const freshProducts = productList.filter((p) => p.id !== heroProduct?.id).slice(0, 4);
  const itemListSchema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Produk bekas pilihan Pojok Seken",
    itemListElement: featuredProducts.map((product, index) => ({
      "@type": "ListItem",
      position: index + 1,
      url: `${siteConfig.url}/products/${product.slug}`,
      name: product.name
    }))
  };

  return (
    <>
      <SchemaScript data={itemListSchema} />
      <section className="hero" data-test-id="home-hero">
        <div className="hero-inner">
          <div className="hero-copy">
            <p className="eyebrow">Marketplace barang bekas terpercaya</p>
            <h1>Temukan barang seken yang masih punya cerita.</h1>
            <p>
              Jelajahi elektronik, kamera, furnitur, sepeda, dan kebutuhan harian
              dari penjual lokal dengan detail kondisi yang jelas.
            </p>
            <form className="search-bar hero-search" action="/search" data-test-id="home-search-form">
              <SearchIcon className="hero-search-icon" />
              <input
                type="search"
                name="q"
                placeholder="Cari laptop, kamera, sofa, sepeda..."
                aria-label="Cari barang bekas"
                autoComplete="off"
                autoCorrect="off"
                spellCheck={false}
                data-test-id="home-search-input"
              />
              <button className="button" type="submit" data-test-id="home-search-submit">
                Cari Sekarang
                <span aria-hidden="true">→</span>
              </button>
            </form>
            <div className="hero-proof" aria-label="Ringkasan marketplace Pojok Seken">
              <span>{productList.length}+ listing aktif</span>
              <span>{categories.length} kategori populer</span>
              <span>Penjual lokal terverifikasi</span>
            </div>
          </div>

          {heroProduct && (
            <div className="hero-panel" aria-label="Produk utama minggu ini">
              <span className="hero-panel-label">Produk utama minggu ini</span>
              <div className="hero-product" data-test-id="home-highlight-product">
                <div className="hero-product-media">
                  <img src={heroProduct.image} alt={`${heroProduct.name} di ${heroProduct.location}`} />
                  <span>{heroProduct.condition}</span>
                </div>
                <div className="hero-product-body">
                  <div className="hero-product-meta">
                    <span>{heroProduct.condition}</span>
                    <span>{heroProduct.location}</span>
                  </div>
                  <strong>{heroProduct.name}</strong>
                  <p>{formatPrice(heroProduct.price)}</p>
                </div>
                <div className="hero-actions" data-test-id="home-hero-actions">
                  <Link className="button glow" href={`/products/${heroProduct.slug}`} data-test-id="home-hero-product">
                    Lihat Detail
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      <section className="category-strip" aria-label="Kategori populer" data-test-id="home-category-strip">
        <div className="container category-inner">
          {categories.map((category) => (
            <Link
              key={category}
              href={`/search?category=${encodeURIComponent(category)}`}
              className="category-chip"
              data-test-id={`home-category-${category.toLowerCase()}`}
            >
              <svg className="category-chip-icon" aria-hidden="true">
                <use href={`/category-sprite.svg#${categoryIconIds[category] || "category-default"}`} />
              </svg>
              {category}
            </Link>
          ))}
        </div>
      </section>

      <section className="section showcase-section" data-test-id="home-featured-products">
        <div className="container">
          <div className="section-head">
            <div>
              <p className="eyebrow">Produk pilihan</p>
              <h2>Barang siap pakai, detailnya siap dicek</h2>
            </div>
            <Link className="button secondary" href="/search" data-test-id="home-view-all-featured">
              Lihat semua
            </Link>
          </div>
          {featuredProducts.length > 0 ? (
            <div className="grid">
              {featuredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="empty-state" data-test-id="home-featured-empty">
              <SearchIcon />
              <h2>Produk belum tersedia</h2>
              <p>Data produk akan tampil otomatis setelah tabel Supabase terisi.</p>
            </div>
          )}
        </div>
      </section>

      <section className="section discovery-section" data-test-id="home-discovery">
        <div className="container discovery-layout">
          <div>
            <p className="eyebrow">Baru masuk</p>
            <h2>Kurasi cepat untuk kebutuhan minggu ini</h2>
            <p>
              Buka detail produk, bandingkan kondisi, lalu pilih barang terdekat
              sebelum janjian cek unit.
            </p>
          </div>
          <div className="mini-products">
            {freshProducts.map((product) => (
              <Link
                key={product.id}
                className="mini-product"
                href={`/products/${product.slug}`}
                data-test-id={`home-fresh-product-${product.id}`}
              >
                <img src={product.image} alt={product.name} />
                <span>{product.category}</span>
                <strong>{product.name}</strong>
                <p>{formatPrice(product.price)}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="section alt" data-test-id="home-benefits">
        <div className="container">
          <div className="section-head">
            <div>
              <p className="eyebrow">Kenapa Pojok Seken</p>
              <h2>Cepat dicari, mudah dibandingkan, nyaman diputuskan</h2>
            </div>
          </div>
          <div className="feature-band">
            <div className="feature" data-test-id="home-benefit-search">
              <SearchIcon />
              <h3>Pencarian fokus</h3>
              <p>Filter produk berdasarkan kategori, kondisi, harga, dan lokasi.</p>
            </div>
            <div className="feature" data-test-id="home-benefit-transparent">
              <ShieldIcon />
              <h3>Info transparan</h3>
              <p>Setiap produk menampilkan kondisi, tahun, penjual, dan catatan utama.</p>
            </div>
            <div className="feature" data-test-id="home-benefit-local">
              <MapIcon />
              <h3>Penjual lokal</h3>
              <p>Temukan barang terdekat agar proses cek unit lebih praktis.</p>
            </div>
            <div className="feature" data-test-id="home-benefit-curated">
              <SparkIcon />
              <h3>Pilihan kurasi</h3>
              <p>Daftar dummy dibuat seperti marketplace sungguhan untuk demo SEO.</p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
