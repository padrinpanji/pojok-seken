import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import ProductGallery from "@/components/ProductGallery";
import ShareListing from "@/components/ShareListing";
import SchemaScript from "@/components/SchemaScript";
import ProductCard from "@/components/ProductCard";
import { CalendarIcon, PinIcon, ShieldIcon, WhatsAppIcon } from "@/components/Icons";
import { formatPrice, getProductBySlug, getProducts, siteConfig, slugifySeller } from "@/data/products";

type ProductPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export async function generateStaticParams() {
  const productList = await getProducts();

  return productList.map((product) => ({
    slug: product.slug
  }));
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) {
    return {
      title: "Produk Tidak Ditemukan"
    };
  }

  return {
    title: `${product.name} ${product.condition}`,
    description: `${product.name} di ${product.location}. ${product.description}`,
    alternates: {
      canonical: `/products/${product.slug}`
    },
    openGraph: {
      type: "article",
      title: `${product.name} di Pojok Seken`,
      description: product.description,
      images: [
        {
          url: product.image,
          width: 1200,
          height: 900,
          alt: product.name
        }
      ]
    }
  };
}

export default async function ProductDetailPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) {
    notFound();
  }

  const productList = await getProducts();
  const sameCategoryProducts = productList.filter(
    (item) => item.category === product.category && item.slug !== product.slug
  );
  // Shuffle and take 5
  const relatedProducts = sameCategoryProducts
    .sort(() => Math.random() - 0.5)
    .slice(0, 5);
  const sellerInitials = product.seller
    .split(" ")
    .map((word) => word[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  const sellerSlug = slugifySeller(product.seller);
  const whatsappMessage = encodeURIComponent(
    `Halo, saya tertarik dengan ${product.name} di Pojok Seken. Apakah masih tersedia?`
  );
  // Category-aware safety guide
  const safetyTip = (() => {
    const cat = product.category.toLowerCase();
    if (cat.includes("elektronik") || cat.includes("laptop") || cat.includes("komputer") || cat.includes("kamera"))
      return "Pastikan Anda melakukan <b>Cash On Delivery (COD)</b>, uji coba perangkat secara langsung, cek kondisi fisik, port, dan baterai, serta minta bukti pembelian asli sebelum membayar.";
    if (cat.includes("furnitur") || cat.includes("sofa") || cat.includes("furniture"))
      return "Pastikan Anda melakukan <b>Cash On Delivery (COD)</b>, periksa material kain, kekuatan engsel/kaki furnitur secara langsung, dan tawar-menawar secara aman bersama penjual sebelum mentransfer dana apa pun.";
    if (cat.includes("kendaraan") || cat.includes("motor") || cat.includes("mobil"))
      return "Pastikan Anda melakukan <b>Cash On Delivery (COD)</b>, periksa kondisi mesin, dokumen kendaraan (STNK/BPKB), dan lakukan test ride/drive sebelum membayar.";
    if (cat.includes("fashion") || cat.includes("pakaian") || cat.includes("baju"))
      return "Pastikan Anda melakukan <b>Cash On Delivery (COD)</b>, periksa kondisi bahan, jahitan, dan ukuran secara langsung sebelum menyepakati harga.";
    if (cat.includes("hobi") || cat.includes("sepeda") || cat.includes("olahraga"))
      return "Pastikan Anda melakukan <b>Cash On Delivery (COD)</b>, uji coba fungsi dan kondisi fisik barang secara langsung, dan pastikan semua komponen berfungsi dengan baik sebelum membayar.";
    if (cat.includes("properti") || cat.includes("rumah") || cat.includes("tanah"))
      return "Pastikan Anda melakukan <b>survei langsung</b> ke lokasi, verifikasi dokumen kepemilikan (sertifikat/AJB), dan gunakan notaris terpercaya sebelum melakukan transaksi apa pun.";
    // default
    return "Pastikan Anda melakukan <b>Cash On Delivery (COD)</b>, periksa kondisi barang secara langsung, dan tawar-menawar secara aman bersama penjual sebelum mentransfer dana apa pun.";
  })();

  const technicalSpecs: string[][] = [
    ["Kategori", product.category],
    ["Kondisi", product.condition],
    ...(product.year ? [["Tahun", product.year]] : []),
    ["Lokasi", product.location],
    ["Penjual", product.seller],
    ...(product.highlights.length ? [["Kelengkapan", product.highlights.join(", ")]] : []),
  ];

  const productSchema = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    image: product.gallery,
    description: product.description,
    category: product.category,
    brand: {
      "@type": "Brand",
      name: siteConfig.name
    },
    offers: {
      "@type": "Offer",
      url: `${siteConfig.url}/products/${product.slug}`,
      priceCurrency: "IDR",
      price: product.price,
      availability: "https://schema.org/InStock",
      itemCondition: "https://schema.org/UsedCondition",
      seller: {
        "@type": "Organization",
        name: product.seller
      }
    }
  };

  return (
    <>
      <SchemaScript data={productSchema} />
      <section className="detail-topbar" data-test-id="product-breadcrumbs">
        <div className="container detail-topbar-inner">
          <div className="breadcrumb">
            <Link href="/" data-test-id="product-breadcrumb-home">
              Beranda
            </Link>
            <span>/</span>
            <Link href="/search" data-test-id="product-breadcrumb-search">
              Semua Produk
            </Link>
            <span>/</span>
            <Link
              href={`/search?category=${encodeURIComponent(product.category)}`}
              data-test-id="product-breadcrumb-category"
            >
              {product.category}
            </Link>
            <span>/</span>
            <span>{product.name}</span>
          </div>
          <div className="detail-utility" data-test-id="product-utility-actions">
            <ShareListing productName={product.name} slug={product.slug} />
          </div>
        </div>
      </section>

      <main className="detail-page section" data-test-id="product-detail-page">
        <div className="container detail-shell">
          <div className="detail-gallery-stack">
            <section className="detail-gallery-card" data-test-id="product-gallery">
              <ProductGallery
                images={product.gallery}
                fallbackImage={product.image}
                productName={product.name}
              />
              <div className="gallery-caption">
                <span>{product.name} - foto produk detail</span>
                <span>Diupload: 1 hari lalu</span>
              </div>
            </section>

            <section className="safety-guide" data-test-id="product-safety-guide">
              <span className="safety-guide-icon" aria-hidden="true">
                <ShieldIcon />
              </span>
              <div>
                <strong>Panduan Aman Berbelanja Second-Hand</strong>
                <p dangerouslySetInnerHTML={{ __html: safetyTip }} />
              </div>
            </section>
          </div>

          <aside className="detail-summary-stack" aria-label="Ringkasan produk">
            <section className="detail-panel premium" data-test-id="product-summary-panel">
              <p className="detail-category-pill" data-test-id="product-category-pill">
                {product.category}
              </p>
              <h1>{product.name}</h1>
              <div className="price">{formatPrice(product.price)}</div>
              <div className="detail-meta-row" data-test-id="product-meta-badges">
                <span className="detail-meta-pill condition">
                  <span className="status-dot" />
                  {product.condition}
                </span>
                <span className="detail-meta-pill">
                  <PinIcon />
                  {product.location}
                </span>
                <span className="detail-meta-pill">
                  <CalendarIcon />
                  Tahun {product.year}
                </span>
              </div>
              <div className="detail-actions">
                {product.source_url ? (
                  <a
                    className="button glow"
                    href={`${product.source_url}${product.source_url.includes("?") ? "&" : "?"}utm_source=pojok-seken&utm_medium=referral&utm_campaign=product-detail`}
                    target="_blank"
                    rel="noopener noreferrer"
                    data-test-id="product-source-link"
                  >
                    <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M15 3h6v6M10 14 21 3M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/></svg>
                    Kunjungi Web Asli
                  </a>
                ) : (
                  <a
                    className="button glow"
                    href={`https://wa.me/628123456789?text=${whatsappMessage}`}
                    data-test-id="product-whatsapp-link"
                  >
                    <WhatsAppIcon />
                    Hubungi Penjual (WhatsApp)
                  </a>
                )}
              </div>
            </section>

            <section className="seller-card" data-test-id="product-seller-card">
              <div className="seller-card-head">
                <p>Informasi akun penjual</p>
                <span>Toko terverifikasi</span>
              </div>
              <div className="seller-profile">
                <div className="seller-avatar" aria-hidden="true">
                  {sellerInitials}
                  <span />
                </div>
                <div>
                  <h2>
                    <Link href={`/users/${sellerSlug}`} data-test-id="product-seller-profile-link">
                      {product.seller}
                    </Link>
                  </h2>
                  <p>Bergabung sejak Maret 2022 - {product.location}</p>
                  <div className="seller-rating" aria-label="Rating penjual 5 dari 5" data-test-id="product-seller-rating">
                    <span aria-hidden="true">★★★★★</span>
                    <strong>5.0</strong>
                  </div>
                </div>
              </div>
            </section>
          </aside>
        </div>

        <div className="container detail-content-grid">
          <div className="detail-content-main">
            <section className="detail-description" data-test-id="product-description">
              <p className="eyebrow">Detail produk</p>
              <h2>Informasi lengkap dari penjual</h2>
              <p className="detail-intro">
                Dijual unit {product.name} tahun {product.year}. {product.description}
              </p>
              <h3>Mengapa {product.name} ini layak dipertimbangkan?</h3>
              <ul className="detail-copy-list">
                {product.highlights.map((highlight) => (
                  <li key={highlight}>
                    <b>{highlight}</b> sudah dicatat penjual sebagai poin utama untuk membantu Anda
                    membandingkan kondisi barang sebelum cek unit.
                  </li>
                ))}
              </ul>
              <div className="condition-note">
                <strong>Catatan Kondisi Fisik:</strong>
                <p>
                  Mohon cek kembali foto, kelengkapan, dan fungsi utama barang saat COD. Jika ada
                  detail tambahan, tanyakan langsung kepada {product.seller} sebelum melakukan pembayaran.
                </p>
              </div>
            </section>

            <section className="detail-specification" data-test-id="product-specification">
              <p className="eyebrow">Tabel spesifikasi</p>
              <h2>Spesifikasi teknis lengkap</h2>
              <div className="spec-table">
                {technicalSpecs.map(([label, value]) => (
                  <div className="spec-table-row" key={label}>
                    <strong>{label}</strong>
                    <span>{value}</span>
                  </div>
                ))}
              </div>
            </section>
          </div>

          <aside className="detail-content-side" aria-label="FAQ produk">
            <section className="detail-faq" data-test-id="product-faq">
              <p className="eyebrow">Tanya jawab (FAQ)</p>
              <details>
                <summary>Apakah barang bisa dicek langsung?</summary>
                <p>Bisa. Gunakan COD agar Anda dapat memeriksa kondisi barang sebelum membayar.</p>
              </details>
              <details>
                <summary>Bisa kirim luar kota atau hanya COD?</summary>
                <p>Utamakan COD. Jika perlu pengiriman, sepakati detail dan bukti transaksi dengan penjual.</p>
              </details>
            </section>
          </aside>
        </div>
      </main>

      {relatedProducts.length > 0 && (
        <section className="section product-related-section">
          <div className="container">
            <div className="section-head">
              <div>
                <p className="eyebrow">Produk serupa</p>
                <h2>Masih dalam kategori {product.category}</h2>
              </div>
              <Link
                className="button secondary"
                href={`/search?category=${encodeURIComponent(product.category)}`}
                data-test-id="product-related-view-all"
              >
                Lihat semua
              </Link>
            </div>
            <div className="grid product-related-grid" data-test-id="product-related-grid">
              {relatedProducts.map((item) => (
                <ProductCard key={item.id} product={item} />
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
