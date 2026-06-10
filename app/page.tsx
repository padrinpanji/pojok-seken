import Link from "next/link";
import ProductCard from "@/components/ProductCard";
import SchemaScript from "@/components/SchemaScript";
import { MapIcon, SearchIcon, ShieldIcon, SparkIcon } from "@/components/Icons";
import { products, siteConfig } from "@/data/products";

export default function HomePage() {
  const featuredProducts = products.slice(0, 3);
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
      <section className="hero">
        <div className="hero-inner">
          <p className="eyebrow">Marketplace barang bekas terpercaya</p>
          <h1>Pojok Seken</h1>
          <p>
            Temukan barang bekas berkualitas dari penjual lokal: elektronik, kamera,
            furnitur, sepeda, dan kebutuhan harian yang masih layak dipakai.
          </p>
          <form className="search-bar" action="/search">
            <input
              type="search"
              name="q"
              placeholder="Cari laptop, kamera, sofa, sepeda..."
              aria-label="Cari barang bekas"
            />
            <button className="button" type="submit">
              <SearchIcon />
              Cari
            </button>
          </form>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="section-head">
            <div>
              <p className="eyebrow">Produk pilihan</p>
              <h2>Barang seken siap pakai</h2>
            </div>
            <Link className="button secondary" href="/search">
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

      <section className="section alt">
        <div className="container">
          <div className="section-head">
            <div>
              <p className="eyebrow">Kenapa Pojok Seken</p>
              <h2>Cepat dicari, mudah dibandingkan, jelas detailnya</h2>
            </div>
          </div>
          <div className="feature-band">
            <div className="feature">
              <SearchIcon />
              <h3>Pencarian fokus</h3>
              <p>Filter produk berdasarkan kategori, kondisi, harga, dan lokasi.</p>
            </div>
            <div className="feature">
              <ShieldIcon />
              <h3>Info transparan</h3>
              <p>Setiap produk menampilkan kondisi, tahun, penjual, dan catatan utama.</p>
            </div>
            <div className="feature">
              <MapIcon />
              <h3>Penjual lokal</h3>
              <p>Temukan barang terdekat agar proses cek unit lebih praktis.</p>
            </div>
            <div className="feature">
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
