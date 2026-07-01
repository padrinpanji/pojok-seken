import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import ProductGallery from "@/components/ProductGallery";
import ShareListing from "@/components/ShareListing";
import SchemaScript from "@/components/SchemaScript";
import ProductCard from "@/components/ProductCard";
import { CalendarIcon, ChatIcon, PinIcon, ShieldIcon, WhatsAppIcon } from "@/components/Icons";
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
  const fallbackProducts = productList.filter(
    (item) => item.category !== product.category && item.slug !== product.slug
  );
  const relatedProducts = [...sameCategoryProducts, ...fallbackProducts].slice(0, 4);
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
  const technicalSpecs = [
    ["Kategori", product.category],
    ["Kondisi", product.condition],
    ["Tahun", product.year],
    ["Lokasi", product.location],
    ["Penjual", product.seller],
    ["Kelengkapan", product.highlights.join(", ")]
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
                <p>
                  Pastikan Anda melakukan <b>Cash On Delivery (COD)</b>, memeriksa material kain,
                  kekuatan engsel/kaki sofa secara langsung, dan tawar-menawar secara aman bersama
                  penjual sebelum mentransfer dana apa pun.
                </p>
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
                <a
                  className="button glow"
                  href={`https://wa.me/628123456789?text=${whatsappMessage}`}
                  data-test-id="product-whatsapp-link"
                >
                  <WhatsAppIcon />
                  Hubungi Penjual (WhatsApp)
                </a>
                <Link className="button secondary glow-soft" href="/contact" data-test-id="product-chat-link">
                  <ChatIcon />
                  Kirim Chat Langsung (Live Chat)
                </Link>
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
              <div className="seller-metrics" data-test-id="product-seller-metrics">
                <div data-test-id="product-seller-sold-count">
                  <span>Produk terjual</span>
                  <strong>34 Unit</strong>
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
                {product.source_url && (
                  <div className="spec-table-row">
                    <strong>Sumber</strong>
                    <span>
                      <a
                        href={product.source_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-emerald-700 underline hover:text-emerald-900 break-all"
                      >
                        Lihat iklan asli
                      </a>
                    </span>
                  </div>
                )}
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
