import Link from "next/link";
import ProductCard from "@/components/ProductCard";
import SchemaScript from "@/components/SchemaScript";
import { MapIcon, SearchIcon, ShieldIcon, SparkIcon } from "@/components/Icons";
import { categories, formatPrice, products, siteConfig } from "@/data/products";

export default function HomePage() {
  const featuredProducts = products.slice(0, 3);
  const heroProduct = products[0];
  const freshProducts = products.slice(1, 5);
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
          </div>

          <form className="search-bar hero-search" action="/search" data-test-id="home-search-form">
            <input
              type="search"
              name="q"
              placeholder="Cari laptop, kamera, sofa, sepeda..."
              aria-label="Cari barang bekas"
              data-test-id="home-search-input"
            />
            <button className="button" type="submit" data-test-id="home-search-submit">
              <SearchIcon />
              Cari
            </button>
          </form>

          <div className="hero-actions" data-test-id="home-hero-actions">
            <Link className="button" href="/search" data-test-id="home-browse-products">
              Lihat barang pilihan
            </Link>
            <Link className="button secondary light" href={`/products/${heroProduct.slug}`} data-test-id="home-hero-product">
              Cek produk utama
            </Link>
          </div>

          <div className="hero-product" data-test-id="home-highlight-product">
            <img src={heroProduct.image} alt={`${heroProduct.name} di ${heroProduct.location}`} />
            <div>
              <span>{heroProduct.condition}</span>
              <strong>{heroProduct.name}</strong>
              <p>{formatPrice(heroProduct.price)} - {heroProduct.location}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="category-strip" aria-label="Kategori populer" data-test-id="home-category-strip">
        <div className="container category-inner">
          <span>Mulai dari</span>
          {categories.map((category) => (
            <Link
              key={category}
              href={`/search?category=${encodeURIComponent(category)}`}
              className="category-chip"
              data-test-id={`home-category-${category.toLowerCase()}`}
            >
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
          <div className="grid">
            {featuredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
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
